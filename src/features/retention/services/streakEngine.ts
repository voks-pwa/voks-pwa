import { getStreak, upsertStreak } from "../repositories/streakRepository";
import type { UserStreak } from "../types";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00Z").getTime();
  const db = new Date(b + "T00:00:00Z").getTime();
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}

/**
 * Records a daily activity (login or checkin) and updates the streak.
 * One activity counts per calendar day. Missing a day breaks the streak.
 */
export async function recordDailyActivity(userId: string): Promise<UserStreak | null> {
  const today = todayDate();
  const existing = await getStreak(userId, "daily");

  if (!existing) {
    const created = await upsertStreak(userId, "daily", {
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today,
      last_activity_at: new Date().toISOString(),
    });
    return created;
  }

  const last = existing.last_activity_date;

  // Already recorded today — idempotent, no change.
  if (last === today) {
    return existing;
  }

  const gap = last ? daysBetween(last, today) : 999;

  let current = existing.current_streak;
  if (gap === 1) {
    current = current + 1;
  } else {
    // Missed one or more days → broken streak.
    current = 1;
  }

  const longest = Math.max(existing.longest_streak, current);

  return upsertStreak(userId, "daily", {
    current_streak: current,
    longest_streak: longest,
    last_activity_date: today,
    last_activity_at: new Date().toISOString(),
  });
}
