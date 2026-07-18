export interface LiveMessage {
  id: number;
  user_id: string;
  message: string;
  created_at: string;
  deleted: boolean;
  pinned: boolean;
  display_name: string | null;
  avatar_url: string | null;
  badge_name: string | null;
  level: number;
}

export interface LiveMessageInsert {
  user_id: string;
  message: string;
  display_name: string | null;
  avatar_url: string | null;
  badge_name: string | null;
  level: number;
}

export interface LivePresence {
  user_id: string;
  joined_at: string;
  last_seen: string;
  duration: number;
}

export interface LiveReaction {
  id: number;
  user_id: string;
  reaction: string;
  created_at: string;
}

export interface LivePoll {
  id: number;
  question: string;
  active: boolean;
  created_at: string;
  options?: LivePollOption[];
}

export interface LivePollOption {
  id: number;
  poll_id: number;
  title: string;
  vote_count?: number;
}

export interface LivePollVote {
  id: number;
  poll_id: number;
  option_id: number;
  user_id: string;
}

export interface LiveGiveaway {
  id: number;
  title: string;
  description: string | null;
  active: boolean;
  winner: string | null;
  created_at: string;
}

export interface LiveGiveawayEntry {
  id: number;
  giveaway_id: number;
  user_id: string;
  created_at: string;
}

export interface LiveModerationLog {
  id: number;
  action: string;
  admin_id: string;
  target_user: string;
  created_at: string;
}

export type LiveReactionType = "❤️" | "🔥" | "👏" | "😂" | "😍" | "👍";

export const LIVE_REACTIONS: LiveReactionType[] = ["❤️", "🔥", "👏", "😂", "😍", "👍"];
