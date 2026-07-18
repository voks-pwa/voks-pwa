export interface LeaderboardUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  badge_name: string | null;
  level: number;
  current_vxp: number;
  lifetime_vxp: number;
  achievement_count: number;
  current_streak: number;
  longest_streak: number;
  mission_completed: number;
  referral_count: number;
  listening_minutes: number;
  created_at: string;
  period_total?: number;
  period_count?: number;
}

export interface RankedLeaderboardUser extends LeaderboardUser {
  rank: number;
  previous_rank: number | null;
  rank_delta: number | null;
}

export interface LeaderboardResponse {
  users: RankedLeaderboardUser[];
  myRank: number | null;
  nearby: RankedLeaderboardUser[];
}
