export interface UserStreak {
  id?: number;
  user_id: string;
  streak_type: "daily" | "weekly" | "monthly";
  current_streak: number;
  longest_streak: number;
  freeze_count: number;
  last_activity_date: string | null;
  last_activity_at: string | null;
}

export interface AchievementCatalogItem {
  slug: string;
  title: string;
  description: string;
  badge_icon: string;
  badge_name: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  reward_vxp: number;
  trigger_type: "mission" | "streak" | "share" | "referral" | "profile" | "listen" | "custom";
  trigger_key: string;
  target_value: number;
  metric: AchievementMetric;
}

export type AchievementMetric =
  | "profile_complete"
  | "share_count"
  | "referral_count"
  | "listen_minutes"
  | "current_streak"
  | "claimed_mission_count";

export interface UserAchievement {
  id?: number;
  user_id: string;
  achievement_id: number;
  progress: number;
  earned_at: string;
  reward_vxp: number;
  seen: boolean;
}

export interface UserBadge {
  id?: number;
  user_id: string;
  badge_key: string;
  badge_name: string;
  badge_icon: string | null;
  source: string;
  source_id: number | null;
  earned_at: string;
}

export interface UserMilestone {
  id?: number;
  user_id: string;
  milestone_key: string;
  milestone_name: string;
  metric: string;
  threshold_value: number;
  reward_vxp: number;
  earned_at: string;
}

export interface UserLoginReward {
  id?: number;
  user_id: string;
  reward_date: string;
  streak_day: number;
  reward_vxp: number;
}

export interface RetentionEventContext {
  userId: string;
  event: import("@/core/action-engine").ActionEvent;
}
