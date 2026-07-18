import { useLeaderboard } from "./useLeaderboard";
import type { LeaderboardPeriod } from "../api/leaderboard";
import type { RankedLeaderboardUser } from "../types";

export interface MyRankResult {
  myRank: number | null;
  nearby: RankedLeaderboardUser[];
  topUsers: RankedLeaderboardUser[];
}

/**
 * Derives "My Rank", the nearby ranking window, and the Top 10 from the
 * Leaderboard Engine response. Pure read of ranked data.
 */
export function useMyRank(
  period: LeaderboardPeriod = "lifetime",
): MyRankResult & { isLoading: boolean; isError: boolean } {
  const { data, isLoading, isError } = useLeaderboard(period);

  if (!data) {
    return {
      myRank: null,
      nearby: [],
      topUsers: [],
      isLoading,
      isError,
    };
  }

  return {
    myRank: data.myRank,
    nearby: data.nearby,
    topUsers: data.users.slice(0, 10),
    isLoading,
    isError,
  };
}
