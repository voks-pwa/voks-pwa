import type { RewardItem } from "../rewardTypes";
import { processRedeem } from "@/features/redeem/engine/redeemEngine";
import { getUserRedemptions } from "../repositories/rewardRedemptionRepository";

export interface RewardResult {
  success: boolean;
  message: string;
  redemptionId?: string;
}

function isPhysicalDelivery(deliveryType?: string): boolean {
  const t = (deliveryType ?? "").toLowerCase();
  return t === "physical" || t === "merchandise" || t === "event" || t === "pickup";
}

export async function processRewardRedemption(
  userId: string,
  reward: RewardItem & { deliveryType?: string; slug?: string },
): Promise<RewardResult> {
  if (!userId) {
    return { success: false, message: "Authentication required" };
  }

  const existing = await getUserRedemptions(userId);
  const userRewards = existing.filter((r) => Number(r.reward_wp_id) === reward.id);

  if (reward.maxPerUser > 0 && userRewards.length >= reward.maxPerUser) {
    return {
      success: false,
      message: `Maximum redemptions (${reward.maxPerUser}) reached for this reward`,
    };
  }

  if (reward.stock <= 0) {
    return { success: false, message: "This reward is out of stock" };
  }

  const physical = isPhysicalDelivery(reward.deliveryType);
  // Shopee-like: physical needs admin approval + shipping, digital/voucher auto-approved
  const result = await processRedeem({
    userId,
    rewardId: reward.id,
    rewardTitle: reward.title,
    requiredVxp: reward.cost,
    approvalRequired: physical,
    voucherReward: !physical,
    needShipping: physical,
  });

  return {
    success: result.success,
    message: result.message,
    redemptionId: result.redeemId,
  };
}
