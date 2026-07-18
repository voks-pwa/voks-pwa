export type RewardSource =
  | "mission"
  | "achievement"
  | "milestone"
  | "login_reward"
  | "badge"
  | "referral"
  | "profile"
  | "admin";

export interface BadgeGrant {
  badge_key: string;
  badge_name: string;
  badge_icon: string | null;
  source: string;
  source_id: number | null;
}

export interface GrantRewardInput {
  userId: string;
  source: RewardSource;
  referenceId: string;
  amount: number;
  reason: string;
  badge?: BadgeGrant;
}

export interface GrantRewardResult {
  success: boolean;
  skipped: boolean;
  error?: string;
}
