import { supabase } from "@/lib/supabase";
import type { RewardItem } from "../rewardTypes";

export interface RewardClaimResult {
  success: boolean;
  message: string;
  redemption?: string;
}

export async function createRewardClaim(
  userId: string,
  reward: RewardItem
): Promise<RewardClaimResult> {

  const { data, error } =
    await supabase.rpc(
      "redeem_reward",
      {
        p_user_id: userId,
        p_reward_wp_id: reward.id,
        p_reward_slug: reward.slug,
        p_reward_name: reward.title,
        p_reward_cost: reward.cost,
      }
    );

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    message: "Reward claimed",
    redemption: data as string | undefined,
  };
}