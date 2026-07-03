import { supabase } from "@/lib/supabase";

export interface RewardClaimResult {
  success: boolean;
  message: string;
  redemption?: unknown;
}

export async function createRewardClaim(
  reward: {
    id: number;
    slug: string;
    title: string;
    cost: number;
  }
): Promise<RewardClaimResult> {

  const { data, error } =
    await supabase.rpc(
      "redeem_reward",
      {
        p_reward_wp_id: reward.id.toString(),
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
    redemption: data,
  };
}