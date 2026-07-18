import type { RewardItem } from "../rewardTypes";
import { processRewardRedemption } from "./RewardEngine";

export async function redeemRewardService(
  userId: string,
  reward: RewardItem
) {
  return processRewardRedemption(
    userId,
    reward
  );
}