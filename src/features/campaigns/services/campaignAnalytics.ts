export interface CampaignAnalytics {
  slug: string;
  missionCount: number;
  participants: number;
  completedParticipants: number;
  joinRate: number;
  completionRate: number;
  rewardClaimed: number;
  avgMissionsCompleted: number;
  avgXpEarned: number;
  funnel: {
    participants: number;
    started: number;
    completed: number;
  };
  topMissions: Array<{ key: string; value: number }>;
  audience: {
    provinces: Array<{ key: string; value: number }>;
    cities: Array<{ key: string; value: number }>;
    gender: Array<{ key: string; value: number }>;
  };
  referrals: number;
  dailyParticipation: Array<{ date: string; count: number }>;
}

import { supabase } from "@/lib/supabase";

/**
 * Read-only analytics fetch. Aggregation happens in the `campaign-analytics`
 * Edge Function (service_role). The client only reads the result — it never
 * touches Mission or Reward Engine logic.
 */
export async function getCampaignAnalytics(
  slug: string,
): Promise<CampaignAnalytics> {
  const { data, error } = await supabase.functions.invoke("campaign-analytics", {
    body: { slug },
  });

  if (error) throw error;
  if (!data?.success) {
    throw new Error(data?.error ?? "Failed to load campaign analytics");
  }

  return data.data as CampaignAnalytics;
}
