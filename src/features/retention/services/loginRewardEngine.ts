import {
  getLoginRewardForDate,
  recordLoginReward,
} from "../repositories/loginRewardRepository";
import { recordDailyActivity } from "./streakEngine";
import { grantReward } from "@/core/reward-engine";
import { track } from "@/core/action-engine/engine";

/** Streak-based daily login reward. Reward grows with streak, capped. */
export function loginRewardForStreak(streakDay: number): number {
  if (streakDay >= 7) return 50;
  return 10 + (streakDay - 1) * 5;
}

/**
 * Grants a daily login reward once per calendar day via the Reward Engine.
 * Also advances the daily streak. Idempotent per day.
 */
export async function processDailyLoginReward(userId: string): Promise<void> {
  const today = new Date().toISOString().split("T")[0];

  const existing = await getLoginRewardForDate(userId, today);
  if (existing) return; // already rewarded today

  const streak = await recordDailyActivity(userId);
  const streakDay = streak?.current_streak ?? 1;
  const reward = loginRewardForStreak(streakDay);

  await recordLoginReward(userId, {
    reward_date: today,
    streak_day: streakDay,
    reward_vxp: reward,
  });

  await grantReward({
    userId,
    source: "login_reward",
    referenceId: `login-${today}`,
    amount: reward,
    reason: `Daily Login Day ${streakDay}`,
  });

  track("REWARD_CLAIM", userId, {
    streak_day: streakDay,
    reward_vxp: reward,
  });
}
