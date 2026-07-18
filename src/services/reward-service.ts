import type { RewardItem } from "@/features/rewards/rewardTypes";
import { redeemRewardService } from "@/features/rewards/services/RewardRedemptionService";

export async function redeemReward(
  userId: string,
  reward: RewardItem
) {
  return redeemRewardService(
    userId,
    reward
  );
}