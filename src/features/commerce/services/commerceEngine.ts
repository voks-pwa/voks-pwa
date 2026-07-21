import {
  recordEventRpc,
  createFulfillmentRpc,
  updateFulfillmentStatusRpc,
  processRefundRpc,
  getCommerceAnalyticsRpc,
  getAllFulfillments,
  getFulfillmentById,
  getFulfillmentByOrder,
  getAllRefunds,
  getRefundsByOrder,
  createRefundRecord,
  getAllCommerceEvents,
  getRefundById,
} from "../repositories/commerceRepository";
import { credit } from "@/features/wallet/services/walletEngine";
import type {
  CommerceEvent,
  MarketplaceFulfillment,
  RefundRecord,
  CommerceAnalytics,
  CommerceActionResult,
  FulfillmentStatus,
  RefundStatus,
} from "../types";

const VALID_FULFILLMENT_TRANSITIONS: Record<FulfillmentStatus, FulfillmentStatus[]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function isValidFulfillmentTransition(from: FulfillmentStatus, to: string): boolean {
  const allowed = VALID_FULFILLMENT_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to as FulfillmentStatus);
}

export async function recordEvent(
  eventType: string,
  options?: {
    userId?: string;
    orderId?: string;
    productId?: string;
    amount?: number;
    metadata?: Record<string, unknown>;
  },
): Promise<CommerceActionResult> {
  return recordEventRpc(
    eventType,
    options?.userId,
    options?.orderId,
    options?.productId,
    options?.amount,
    options?.metadata,
  );
}

export async function createFulfillment(orderId: string): Promise<CommerceActionResult> {
  return createFulfillmentRpc(orderId);
}

export async function updateFulfillmentStatus(
  fulfillmentId: string,
  status: string,
  options?: { trackingNumber?: string; carrier?: string; notes?: string },
): Promise<CommerceActionResult> {
  const fulfillment = await getFulfillmentByIdSafe(fulfillmentId);

  if (fulfillment && !isValidFulfillmentTransition(fulfillment.status, status)) {
    return {
      success: false,
      error: `Cannot transition from ${fulfillment.status} to ${status}`,
    };
  }

  return updateFulfillmentStatusRpc(
    fulfillmentId,
    status,
    options?.trackingNumber,
    options?.carrier,
    options?.notes,
  );
}

async function getFulfillmentByIdSafe(fulfillmentId: string): Promise<MarketplaceFulfillment | null> {
  return getFulfillmentById(fulfillmentId);
}

export async function processRefund(
  refundId: string,
  status: RefundStatus,
  processedBy?: string,
): Promise<CommerceActionResult> {
  if (status !== "COMPLETED") {
    return processRefundRpc(refundId, status, processedBy);
  }

  const refund = await getRefundById(refundId);
  if (!refund) {
    return { success: false, error: "Refund not found" };
  }

  // Atomic order/inventory/voucher mutation first
  const result = await processRefundRpc(refundId, status, processedBy);
  if (!result.success) {
    return result;
  }

  // Wallet credit for WALLET refunds (must go through Wallet Ledger V2)
  if (refund.refund_method === "WALLET") {
    await credit({
      userId: refund.user_id,
      amount: refund.amount,
      transactionType: "REFUND",
      transactionKey: `REFUND_${refundId}`,
      referenceType: "REFUND",
      referenceId: refund.order_id,
      description: `Refund for order ${refund.order_id.slice(0, 8)}`,
    });
  }

  return result;
}

export async function getAnalytics(days?: number): Promise<CommerceAnalytics | null> {
  const result = await getCommerceAnalyticsRpc(days);
  if (!result.success) return null;
  return result as unknown as CommerceAnalytics;
}

export async function getFulfillments(): Promise<MarketplaceFulfillment[]> {
  return getAllFulfillments();
}

export async function getFulfillment(orderId: string): Promise<MarketplaceFulfillment | null> {
  return getFulfillmentByOrder(orderId);
}

export async function getRefunds(): Promise<RefundRecord[]> {
  return getAllRefunds();
}

export async function getOrderRefunds(orderId: string): Promise<RefundRecord[]> {
  return getRefundsByOrder(orderId);
}

export async function requestRefund(
  orderId: string,
  userId: string,
  amount: number,
  reason: string,
): Promise<RefundRecord | null> {
  return createRefundRecord(orderId, userId, amount, reason);
}

export async function getEvents(days?: number): Promise<CommerceEvent[]> {
  return getAllCommerceEvents(days);
}
