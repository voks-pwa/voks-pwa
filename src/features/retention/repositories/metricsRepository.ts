import { supabase } from "@/lib/supabase";

export async function getShareCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("activity_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("activity_type", "share");
  return count ?? 0;
}

export async function getReferralCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_id", userId)
    .eq("reward_granted", true);
  return count ?? 0;
}

export async function getProgressForMission(userId: string, missionId: number): Promise<number> {
  const { data } = await supabase
    .from("missions_progress")
    .select("progress")
    .eq("user_id", userId)
    .eq("mission_id", missionId)
    .maybeSingle();
  return data?.progress ?? 0;
}

export async function getClaimedMissionCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("missions_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("claimed", true);
  return count ?? 0;
}
