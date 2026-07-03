import { processRewardRedemption } from "./RewardEngine";

export async function redeemRewardService(
  userId: string,
  reward: {
    id: number;
    slug: string;
    title: string;
    cost: number;
  }
) {
  return processRewardRedemption(
    userId,
    reward
  );
}