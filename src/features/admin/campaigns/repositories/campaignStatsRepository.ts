import { supabase } from "@/lib/supabase";

export interface MissionProgressRow {
  user_id: string;
  mission_id: number;
  completed: boolean;
}

export interface MissionCompletionRow {
  user_id: string;
  mission_id: number;
  reward_vxp: number;
}

export async function getMissionProgressByMissionIds(
  missionIds: number[],
): Promise<MissionProgressRow[]> {
  if (missionIds.length === 0) return [];

  const { data, error } = await supabase
    .from("missions_progress")
    .select("user_id, mission_id, completed")
    .in("mission_id", missionIds);

  if (error) throw error;
  return data ?? [];
}

export async function getMissionCompletionsByMissionIds(
  missionIds: number[],
): Promise<MissionCompletionRow[]> {
  if (missionIds.length === 0) return [];

  const { data, error } = await supabase
    .from("mission_completions")
    .select("user_id, mission_id, reward_vxp")
    .in("mission_id", missionIds);

  if (error) throw error;
  return data ?? [];
}

export async function getCampaignIdBySlug(
  slug: string,
): Promise<number | null> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

export async function getCampaignRewardCount(
  campaignId: number,
): Promise<number> {
  const { count, error } = await supabase
    .from("campaign_rewards")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", campaignId);

  if (error) throw error;
  return count ?? 0;
}
