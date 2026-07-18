import { supabase } from "@/lib/supabase";

import type {
  LeaderboardUser,
  LeaderboardResponse,
} from "../types";

export type LeaderboardPeriod =
  | "lifetime"
  | "weekly"
  | "monthly";

export async function getLeaderboard(
  period: LeaderboardPeriod = "lifetime",
): Promise<LeaderboardResponse> {
  const { data, error } = await supabase.functions.invoke(
    `leaderboard?period=${period}`,
  );

  if (error) throw error;

  if (!data.success) {
    throw new Error(
      data.error ?? "Failed to load leaderboard",
    );
  }

  const payload = data.data as {
    users: (LeaderboardUser & {
      rank: number;
      previous_rank: number | null;
      rank_delta: number | null;
    })[];
    myRank: number | null;
    nearby: typeof data.data.users;
  };

  return {
    users: payload.users ?? [],
    myRank: payload.myRank ?? null,
    nearby: payload.nearby ?? [],
  };
}
