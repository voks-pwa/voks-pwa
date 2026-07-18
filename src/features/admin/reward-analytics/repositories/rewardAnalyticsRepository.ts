import { supabase } from "@/lib/supabase";
import type { RewardAnalyticsResponse } from "../types";

export async function getRewardAnalytics(days: number = 30): Promise<RewardAnalyticsResponse> {
  const { data, error } = await supabase.functions.invoke("reward-analytics", {
    body: { days },
  });

  if (error) throw error;
  if (!data.success) throw new Error(data.error ?? "Failed to load reward analytics");

  return data.data as RewardAnalyticsResponse;
}
