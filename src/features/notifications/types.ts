export type NotificationCategory =
  | "mission"
  | "campaign"
  | "achievement"
  | "reward"
  | "leaderboard"
  | "live"
  | "promo"
  | "referral"
  | "profile"
  | "system"
  | "admin";

export type NotificationEventType =
  | "mission_started"
  | "mission_completed"
  | "mission_claimed"
  | "campaign_started"
  | "campaign_ending"
  | "campaign_finished"
  | "achievement_unlocked"
  | "reward_redeemed"
  | "leaderboard_rank_up"
  | "leaderboard_top10"
  | "live_started"
  | "live_favorite_host"
  | "promo_new"
  | "referral_friend_joined"
  | "profile_completed"
  | "system_maintenance"
  | "admin_broadcast";

export type NotificationState = "unread" | "read" | "archived" | "deleted";

export interface NotificationEvent {
  type: NotificationEventType;
  userId?: string;
  title?: string;
  message?: string;
  image?: string;
  actionTarget?: string;
  payload?: Record<string, unknown>;
  metadata?: {
    missionId?: number;
    reward?: number;
    progress?: number;
    campaignSlug?: string;
    rank?: number;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  category: NotificationCategory;
  event_type: NotificationEventType;
  title: string;
  message: string;
  icon?: string;
  image?: string;
  action_type?: string;
  action_target?: string;
  payload?: Record<string, unknown>;
  read: boolean;
  read_at?: string;
  dismissed: boolean;
  archived_at?: string;
  created_at: string;
}

export function categoryForEvent(eventType: NotificationEventType): NotificationCategory {
  if (eventType.startsWith("mission_")) return "mission";
  if (eventType.startsWith("campaign_")) return "campaign";
  if (eventType.startsWith("achievement_")) return "achievement";
  if (eventType.startsWith("reward_")) return "reward";
  if (eventType.startsWith("leaderboard_")) return "leaderboard";
  if (eventType.startsWith("live_")) return "live";
  if (eventType.startsWith("promo_")) return "promo";
  if (eventType.startsWith("referral_")) return "referral";
  if (eventType.startsWith("profile_")) return "profile";
  if (eventType.startsWith("system_")) return "system";
  if (eventType.startsWith("admin_")) return "admin";
  return "system";
}

export function defaultTitle(eventType: NotificationEventType): string {
  switch (eventType) {
    case "mission_completed": return "Mission Complete";
    case "mission_claimed": return "Reward Claimed";
    case "campaign_started": return "Campaign Started";
    case "campaign_ending": return "Ending Soon";
    case "campaign_finished": return "Campaign Ended";
    case "achievement_unlocked": return "Achievement Unlocked";
    case "reward_redeemed": return "Reward Redeemed";
    case "leaderboard_rank_up": return "Rank Up";
    case "leaderboard_top10": return "Top 10";
    case "live_started": return "Live Now";
    case "live_favorite_host": return "Favorite Host Live";
    case "promo_new": return "New Promo";
    case "referral_friend_joined": return "Friend Joined";
    case "profile_completed": return "Profile Complete";
    case "admin_broadcast": return "Announcement";
    default: return "Notification";
  }
}

export function defaultMessage(eventType: NotificationEventType, metadata?: NotificationEvent["metadata"]): string {
  switch (eventType) {
    case "mission_started": return "A new mission is available.";
    case "mission_completed": return metadata?.missionId ? `Mission completed. +${metadata.reward ?? 0} XP` : "Mission completed.";
    case "mission_claimed": return `Claimed ${metadata?.reward ?? 0} XP.`;
    case "campaign_started": return metadata?.campaignSlug ? `Campaign "${metadata.campaignSlug}" is now live.` : "A campaign has started.";
    case "campaign_ending": return "Campaign ends in less than 24 hours.";
    case "campaign_finished": return "Campaign has ended. Thanks for participating.";
    case "achievement_unlocked": return metadata?.reward ? `+${metadata.reward} XP` : "Achievement unlocked.";
    case "reward_redeemed": return "Your reward has been redeemed.";
    case "leaderboard_rank_up": return metadata?.rank ? `You moved to rank #${metadata.rank}.` : "You ranked up.";
    case "leaderboard_top10": return "You're in the Top 10!";
    case "live_started": return "A live broadcast has started.";
    case "live_favorite_host": return "Your favorite host is now live.";
    case "promo_new": return "Check out the latest promo.";
    case "referral_friend_joined": return "A friend joined using your referral.";
    case "profile_completed": return "Your profile is complete.";
    case "admin_broadcast": return "New announcement from VOKS.";
    default: return "";
  }
}

export const CATEGORY_ICONS: Record<NotificationCategory, string> = {
  mission: "flag",
  campaign: "megaphone",
  achievement: "trophy",
  reward: "gift",
  leaderboard: "trending-up",
  live: "radio",
  promo: "percent",
  referral: "users",
  profile: "user-check",
  system: "bell",
  admin: "shield",
};
