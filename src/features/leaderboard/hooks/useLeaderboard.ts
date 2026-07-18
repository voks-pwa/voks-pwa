import { useQuery } from "@tanstack/react-query";

import {
  getLeaderboard,
} from "../api/leaderboard";

import type {
  LeaderboardPeriod,
} from "../api/leaderboard";

export function useLeaderboard(
  period: LeaderboardPeriod = "lifetime"
) {
  return useQuery({
    queryKey: [
      "leaderboard",
      period,
    ],
    queryFn: () =>
      getLeaderboard(period),
    refetchInterval:
      30_000,
  });
}
