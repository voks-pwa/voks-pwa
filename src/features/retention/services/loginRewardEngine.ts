import {
  getLoginRewardForDate,
  recordLoginReward,
} from "../repositories/loginRewardRepository";
import { recordDailyActivity } from "./streakEngine";
import { grantReward } from "@/core/reward-engine";
import { track } from "@/core/action-engine/engine";
import { calculateXP, loadEconomyConfig } from "@/features/economy/services/economyEngine";

export async function loginRewardForStreak(userId: string, streakDay: number): Promise<number> {
  const config = await loadEconomyConfig();

  const dailyCalc = await calculateXP({ source: "DAILY_LOGIN", userId, context: { streakDay } });
  const streakCalc = await calculateXP({ source: "STREAK_LOGIN", userId, context: { streakDay } });

  const value = dailyCalc.finalXP + (streakDay - 1) * streakCalc.finalXP;
  const maxXp = config?.VXP_EARNING_DAILY_CAP ?? 200;

  return Math.min(value, maxXp);
}

export async function processDailyLoginReward(userId: string): Promise<void> {
  const today = new Date().toISOString().split("T")[0];

  const existing = await getLoginRewardForDate(userId, today);
  if (existing) return;

  const streak = await recordDailyActivity(userId);
  const streakDay = streak?.current_streak ?? 1;
  const reward = await loginRewardForStreak(userId, streakDay);

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
