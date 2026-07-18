/**
 * Leaderboard Engine — Rank Calculator
 *
 * Deterministic, stable ranking per AI/73 RANKING_RULES.
 * Tie-break order (highest priority first):
 *   1. Current VXP
 *   2. Lifetime VXP
 *   3. Achievement Count
 *   4. Longest Streak
 *   5. Created At (earlier account ranks higher)
 *
 * The sort is stable: users equal on every key keep their relative input
 * order, so ranking never changes randomly when scores are tied.
 *
 * The Leaderboard Engine is READ ONLY. This module only reads and
 * computes — it never writes XP or any other value.
 */

export interface RankableUser {
  id: string;
  current_vxp: number;
  lifetime_vxp: number;
  achievement_count: number;
  longest_streak: number;
  created_at: string;
  [key: string]: unknown;
}

export interface RankedUser<T extends RankableUser> {
  user: T;
  rank: number;
  previous_rank: number | null;
  rank_delta: number | null;
}

const SORTERS: Array<(u: RankableUser) => number> = [
  (u) => Number(u.current_vxp) || 0,
  (u) => Number(u.lifetime_vxp) || 0,
  (u) => Number(u.achievement_count) || 0,
  (u) => Number(u.longest_streak) || 0,
  // earlier created_at ranks higher → smaller value is better
  (u) => -new Date(u.created_at).getTime(),
];

/**
 * Assigns 1-based ranks to a list of users already in display order.
 * Maintains stable ordering for ties (equal on all keys → keep input order).
 */
export function calculateRanks<T extends RankableUser>(
  users: T[],
  previousRanks: Record<string, number> = {},
): RankedUser<T>[] {
  const indexed = users.map((user, index) => ({ user, index }));

  indexed.sort((a, b) => {
    for (const sort of SORTERS) {
      const diff = sort(b.user) - sort(a.user);
      if (diff !== 0) return diff > 0 ? 1 : -1;
    }
    // All keys equal → stable by original index
    return a.index - b.index;
  });

  return indexed.map(({ user }, i) => {
    const rank = i + 1;
    const prev = previousRanks[user.id] ?? null;
    return {
      user,
      rank,
      previous_rank: prev,
      rank_delta: prev !== null ? prev - rank : null,
    };
  });
}
