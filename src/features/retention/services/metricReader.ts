import { getCanonicalUser } from "@/features/profile/services/userCanonicalService";
import { supabase } from "@/lib/supabase";
import type { AchievementMetric } from "../types";

/**
 * Reads a retention metric from the canonical data sources.
 * All values are sourced from Supabase (profiles, missions_progress,
 * referrals, activity_logs, user_streaks) — never from UI or React state.
 */
export async function readMetric(
  metric: AchievementMetric | string,
  userId: string,
): Promise<number> {
  switch (metric) {
    case "profile_complete": {
      const canonical = await getCanonicalUser(userId);
      return canonical.profile_completed ? 1 : 0;
    }

    case "share_count": {
      const { count } = await supabase
        .from("activity_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("activity_type", "share");
      return count ?? 0;
    }

    case "referral_count": {
      const { count } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", userId)
        .eq("reward_granted", true);
      return count ?? 0;
    }

    case "listen_minutes": {
      const { data } = await supabase
        .from("missions_progress")
        .select("progress")
        .eq("user_id", userId)
        .eq("mission_id", listenMissionId())
        .maybeSingle();
      // progress is stored in seconds for listen missions
      return Math.floor((data?.progress ?? 0) / 60);
    }

    case "current_streak": {
      const { data } = await supabase
        .from("user_streaks")
        .select("current_streak")
        .eq("user_id", userId)
        .eq("streak_type", "daily")
        .maybeSingle();
      return data?.current_streak ?? 0;
    }

    case "claimed_mission_count": {
      const { count } = await supabase
        .from("missions_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("claimed", true);
      return count ?? 0;
    }

    default:
      return 0;
  }
}

let cachedListenMissionId: number | null = null;
export function setListenMissionId(id: number) {
  cachedListenMissionId = id;
}
function listenMissionId(): number {
  return cachedListenMissionId ?? -1;
}
