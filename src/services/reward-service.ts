import { redeemRewardService } from "@/features/rewards/services/RewardRedemptionService";

export async function redeemReward(
  userId: string,
  reward: {
    id: number;
    slug: string;
    title: string;
    cost: number;
  }
) {
  return redeemRewardService(
    userId,
    reward
  );
}