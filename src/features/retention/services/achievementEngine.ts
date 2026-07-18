import {
  getCatalog,
  getEarnedAchievements,
  upsertUserAchievement,
} from "../repositories/achievementRepository";
import { readMetric } from "./metricReader";
import { grantReward } from "@/core/reward-engine";
import { track } from "@/core/action-engine/engine";

/**
 * Evaluates all active achievements for a user based on current metric values.
 * Achievements are completed when progress >= target. On completion the
 * Badge Engine grants a permanent badge and the Reward Engine awards XP.
 *
 * Pure event consumer — never reads UI or React state.
 */
export async function evaluateAchievements(userId: string): Promise<void> {
  const catalog = await getCatalog();
  const earned = await getEarnedAchievements(userId);
  const earnedMap = new Map(earned.map((e) => [e.achievement_id, e]));

  for (const item of catalog) {
    const metricKey = item.trigger_key as
      | "profile_complete"
      | "share_count"
      | "referral_count"
      | "listen_minutes"
      | "current_streak"
      | "claimed_mission_count";

    const value = await readMetric(metricKey, userId);
    const progress = Math.min(value, item.target_value);
    const completed = value >= item.target_value;

    const already = earnedMap.get(item.id);

    if (already && already.reward_vxp > 0) {
      continue;
    }

    await upsertUserAchievement(userId, item.id, {
      progress,
      earned_at: completed ? new Date().toISOString() : new Date(0).toISOString(),
      reward_vxp: completed ? item.reward_vxp : 0,
    });

    if (completed) {
      const guard = await grantReward({
        userId,
        source: "achievement",
        referenceId: item.slug,
        amount: item.reward_vxp,
        reason: `Achievement: ${item.title}`,
        badge: {
          badge_key: item.slug,
          badge_name: item.badge_name,
          badge_icon: item.badge_icon,
          source: "achievement",
          source_id: item.id,
        },
      });

      if (guard.skipped) continue;

      track("ACHIEVEMENT_UNLOCK", userId, {
        slug: item.slug,
        title: item.title,
        reward_vxp: item.reward_vxp,
      });
    }
  }
}
