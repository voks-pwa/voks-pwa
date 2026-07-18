import { supabase } from "@/lib/supabase";
import type { UserLoginReward } from "../types";

export async function getLoginRewardForDate(
  userId: string,
  rewardDate: string,
): Promise<UserLoginReward | null> {
  const { data, error } = await supabase
    .from("user_login_rewards")
    .select("*")
    .eq("user_id", userId)
    .eq("reward_date", rewardDate)
    .maybeSingle();

  if (error) {
    console.error("[LOGIN_REWARD] read error", error);
    return null;
  }

  return (data as UserLoginReward | null) ?? null;
}

export async function recordLoginReward(
  userId: string,
  reward: Omit<UserLoginReward, "id" | "user_id">,
): Promise<UserLoginReward | null> {
  const { data, error } = await supabase
    .from("user_login_rewards")
    .insert({
      user_id: userId,
      reward_date: reward.reward_date,
      streak_day: reward.streak_day,
      reward_vxp: reward.reward_vxp,
    })
    .select()
    .single();

  if (error) {
    console.error("[LOGIN_REWARD] insert error", error);
    return null;
  }

  return data as UserLoginReward;
}
