import { debit } from "@/features/wallet/services/walletEngine";
import { validateTransaction } from "@/features/economy/services/economyEngine";
import {
  createPaymentRecord,
  updatePaymentStatus,
} from "../repositories/paymentRepository";
import type { PaymentResult, WebhookPayload } from "../types";

import { getPaymentById } from "../repositories/paymentRepository";

const GATEWAY_REDIRECTS: Record<string, string> = {
  MIDTRANS: "https://app.midtrans.com/payment",
  XENDIT: "https://checkout.xendit.co/payment",
  QRIS: "qris://payment",
  BANK_TRANSFER: "https://payment.voks.app/bank-transfer",
  CREDIT_CARD: "https://payment.voks.app/credit-card",
};

export async function initiatePayment(
  userId: string,
  orderId: string,
  totalAmount: number,
  paymentMethod: string = "VXP",
): Promise<PaymentResult> {
  if (!userId) return { success: false, error: "User ID required" };

  if (paymentMethod === "VXP") {
    const validation = await validateTransaction({
      userId,
      amount: -totalAmount,
    });

    if (!validation.allowed) {
      return { success: false, error: validation.error ?? "Insufficient VXP balance" };
    }

    const walletResult = await debit({
      userId,
      amount: totalAmount,
      transactionType: "REDEEM",
      transactionKey: `CHECKOUT_VXP_${userId}_${orderId}_${Date.now()}`,
      referenceType: "MARKETPLACE",
      referenceId: orderId,
      description: `VXP payment for order ${orderId}`,
    });

    if (!walletResult.success) {
      return { success: false, error: walletResult.error ?? "Payment failed" };
    }

    return {
      success: true,
      payment_method: "VXP",
      amount: totalAmount,
      payment_id: walletResult.transaction_id?.toString(),
    };
  }

  const paymentResult = await createPaymentRecord(
    orderId,
    userId,
    totalAmount,
    paymentMethod,
    "VXP",
    `PAY_${userId}_${orderId}_${Date.now()}`,
  );

  if (!paymentResult.success) {
    return paymentResult;
  }

  return {
    ...paymentResult,
    redirect_url: GATEWAY_REDIRECTS[paymentMethod] ?? undefined,
  };
}

export async function processPaymentCallback(payload: WebhookPayload): Promise<PaymentResult> {
  const { gateway_txn_id, status, payment_id } = payload;

  if (!payment_id) {
    return { success: false, error: "Payment ID required" };
  }

  const result = await updatePaymentStatus(
    payment_id,
    status === "success" || status === "capture" || status === "settlement"
      ? "SUCCESS"
      : status === "deny" || status === "cancel" || status === "expire"
        ? "FAILED"
        : "PENDING",
    gateway_txn_id,
    payload.raw as Record<string, unknown>,
  );

  return result;
}

export async function getPaymentDetail(paymentId: string) {
  return getPaymentById(paymentId);
}
