import { getCanonicalUser } from "@/features/profile/services/userCanonicalService";
import { getStreak } from "../repositories/streakRepository";
import { getShareCount, getReferralCount, getProgressForMission, getClaimedMissionCount } from "../repositories/metricsRepository";
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
      return getShareCount(userId);
    }

    case "referral_count": {
      return getReferralCount(userId);
    }

    case "listen_minutes": {
      const seconds = await getProgressForMission(userId, listenMissionId());
      return Math.floor(seconds / 60);
    }

    case "current_streak": {
      const streak = await getStreak(userId, "daily");
      return streak?.current_streak ?? 0;
    }

    case "claimed_mission_count": {
      return getClaimedMissionCount(userId);
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
