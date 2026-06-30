import { supabase } from "@/lib/supabase";

export async function redeemReward(
  reward: {
    id: number;
    slug: string;
    title: string;
    cost: number;
  }
) {
  const { data, error } = await supabase.rpc(
    "redeem_reward",
    {
      p_reward_wp_id: reward.id.toString(),
      p_reward_slug: reward.slug,
      p_reward_name: reward.title,
      p_reward_cost: reward.cost,
    }
  );

  if (error) throw error;

  return data;
}