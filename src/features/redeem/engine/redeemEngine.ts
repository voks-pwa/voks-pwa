import { getCanonicalUser } from "@/features/profile/services/userCanonicalService";
import { debit, credit } from "@/features/wallet/services/walletEngine";
import { track } from "@/core/action-engine/engine";
import { getUserRedeems, insertRedeem } from "../repositories/redeemRepository";
import { checkStock, reserveStock, deductStock, releaseReservation } from "@/features/inventory/services/inventoryEngine";
import type { RedeemInput, RedeemResult, ShippingAddress } from "../types";

export interface RedeemEngineDependencies {
  recordEvent?: (eventType: string, options?: {
    userId?: string;
    orderId?: string;
    productId?: string;
    amount?: number;
    metadata?: Record<string, unknown>;
  }) => Promise<unknown>;
  requestVoucher?: (rewardId: number) => Promise<{ success: boolean; voucher_id?: string; error?: string }>;
  assignVoucher?: (voucherId: string, userId: string) => Promise<{ success: boolean }>;
  createFulfillment?: (redeemId: string, userId: string, rewardId: number, address: ShippingAddress) => Promise<{ success: boolean }>;
}

export async function processRedeem(
  input: RedeemInput,
  deps?: RedeemEngineDependencies,
): Promise<RedeemResult> {
  if (!input.userId) {
    return { success: false, message: "Authentication required" };
  }

  if (input.requiredVxp <= 0) {
    return { success: false, message: "Invalid reward cost" };
  }

  const stockCheck = await checkStock(input.rewardId);
  if (!stockCheck.available) {
    return { success: false, message: "This reward is out of stock" };
  }

  const existing = await getUserRedeems(input.userId);
  const pendingCount = existing.filter(
    (r) => r.reward_id === input.rewardId && (r.status === "PENDING" || r.status === "APPROVED")
  ).length;

  if (pendingCount > 0) {
    return { success: false, message: "You already have a pending redemption for this reward" };
  }

  const canonical = await getCanonicalUser(input.userId);
  if (canonical.current_vxp < input.requiredVxp) {
    return { success: false, message: "Insufficient VXP" };
  }

  const reservation = await reserveStock(input.rewardId, 1);
  if (!reservation.success) {
    return { success: false, message: reservation.error ?? "Failed to reserve stock" };
  }

  const deduction = await debit({
    userId: input.userId,
    amount: input.requiredVxp,
    transactionType: "REDEEM",
    referenceType: "reward",
    referenceId: `redeem_${input.rewardId}`,
    description: `Redeem Reward: ${input.rewardTitle}`,
  });

  if (!deduction.success) {
    await releaseReservation(input.rewardId);
    return { success: false, message: deduction.error ?? "Failed to deduct VXP" };
  }

  const status = input.approvalRequired ? "PENDING" : "APPROVED";

  let redeemRecord;
  try {
    redeemRecord = await insertRedeem({
      userId: input.userId,
      rewardId: input.rewardId,
      rewardTitle: input.rewardTitle,
      requiredVxp: input.requiredVxp,
      approvalRequired: input.approvalRequired,
      status,
    });
  } catch {
    await releaseReservation(input.rewardId);
    await credit({
      userId: input.userId,
      amount: input.requiredVxp,
      transactionType: "REFUND",
      referenceType: "reward",
      referenceId: `refund_${input.rewardId}`,
      description: `Refund: ${input.rewardTitle} redemption failed`,
    });

    return { success: false, message: "Failed to create redeem record. VXP refunded." };
  }

  if (status === "APPROVED") {
    await deductStock(input.rewardId, 1, "redeem", redeemRecord.id);

    if (input.voucherReward && deps?.requestVoucher && deps?.assignVoucher) {
      const voucherResult = await deps.requestVoucher(input.rewardId);
      if (voucherResult.success && voucherResult.voucher_id) {
        await deps.assignVoucher(voucherResult.voucher_id, input.userId);
      }
    }

    if (input.needShipping && input.shippingAddress && deps?.createFulfillment) {
      await deps.createFulfillment(
        redeemRecord.id,
        input.userId,
        input.rewardId,
        input.shippingAddress,
      );
    }
  }

  try {
    await track("REWARD_REDEEM", input.userId, {
      redeem_id: redeemRecord.id,
      reward_id: input.rewardId,
      reward_title: input.rewardTitle,
      required_vxp: input.requiredVxp,
      status,
    });
    if (deps?.recordEvent) {
      await deps.recordEvent("redeem", {
        userId: input.userId,
        orderId: redeemRecord.id,
        amount: input.requiredVxp,
        metadata: { reward_id: input.rewardId, reward_title: input.rewardTitle, status },
      });
    }
  } catch {
    /* notification failure does not rollback */
  }

  return {
    success: true,
    message: status === "PENDING" ? "Redemption submitted for approval" : "Reward redeemed successfully",
    redeemId: redeemRecord.id,
  };
}
