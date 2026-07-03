import { deductVXP } from "@/features/profile/services/profileXPService";
import { createRewardClaim } from "./RewardClaimService";

export interface RewardItem {
  id: number;
  slug: string;
  title: string;
  cost: number;
}

export interface RewardResult {
  success: boolean;
  message: string;
  redemptionId?: string;
}

export async function processRewardRedemption(
  userId: string,
  reward: RewardItem
): Promise<RewardResult> {

  /**
   * STEP 1
   * Deduct XP
   */

  const xpResult = await deductVXP(
    userId,
    reward.cost,
    `Redeem Reward : ${reward.title}`,
    reward.id.toString()
  );

  if (!xpResult.success) {
    return {
      success: false,
      message: xpResult.message,
    };
  }

  /**
   * STEP 2
   * Create reward claim
   */

  const claim = await createRewardClaim(reward);

  if (!claim.success) {
    return {
      success: false,
      message: claim.message,
    };
  }

  /**
   * STEP 3
   * Success
   */

  return {
    success: true,
    message: claim.message,
    redemptionId: String(claim.redemption ?? ""),
  };
}