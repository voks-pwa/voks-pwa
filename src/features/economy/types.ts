export type CurrencyType = "VXP" | "PREMIUM";

export interface EconomyConfig {
  CURRENCIES: CurrencyType[];
  VXP_EARNING_DAILY_CAP: number;
  VXP_SPENDING_DAILY_CAP: number;
  VXP_SPENDING_WEEKLY_CAP: number;
  VXP_SPENDING_MONTHLY_CAP: number;
  VXP_MIN_BALANCE_FOR_REDEMPTION: number;
  ECONOMY_VERSION: number;
}

export interface SpendingPeriod {
  spent: number;
  cap: number;
  remaining: number;
}

export interface SpendingLimitResult {
  allowed: boolean;
  daily: SpendingPeriod;
  weekly: SpendingPeriod;
  monthly: SpendingPeriod;
  proposed: number;
  wouldExceed: "daily" | "weekly" | "monthly" | null;
}

export interface BalanceSnapshot {
  id: number;
  user_id: string;
  currency_type: CurrencyType;
  balance: number;
  lifetime_earned: number;
  snapshot_date: string;
  created_at: string;
}

export interface EconomyResult<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

export type XpSource =
  | "MISSION_COMPLETE"
  | "MISSION_DAILY"
  | "MISSION_WEEKLY"
  | "MISSION_MONTHLY"
  | "CAMPAIGN_COMPLETE"
  | "CAMPAIGN_SHARE"
  | "CAMPAIGN_JOIN"
  | "REFERRAL_INVITE"
  | "REFERRAL_REGISTER"
  | "REFERRAL_FIRST_LOGIN"
  | "ACHIEVEMENT_UNLOCK"
  | "BADGE_UNLOCK"
  | "LISTENING_MINUTE"
  | "LISTENING_HOUR"
  | "DAILY_LOGIN"
  | "STREAK_LOGIN"
  | "REWARD_CASHBACK"
  | "ADMIN_ADJUSTMENT"
  | "ADMIN_BONUS"
  | `MILESTONE_${string}`
  | `ACHIEVEMENT_${string}`
  | (string & {});

export interface XpRule {
  id: string;
  slug: string;
  title: string;
  source: string;
  base_xp: number;
  enabled: boolean;
  priority: number;
  cooldown_minutes: number | null;
  daily_limit: number | null;
  weekly_limit: number | null;
  monthly_limit: number | null;
  minimum_level: number | null;
  maximum_level: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface XpMultiplier {
  id: string;
  slug: string;
  title: string;
  multiplier: number;
  type: "global" | "event" | "vip" | "campaign" | "holiday" | "weekend" | "level";
  enabled: boolean;
  priority: number;
  start_date: string | null;
  end_date: string | null;
  conditions: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface XpCalculation {
  source: XpSource;
  baseXP: number;
  multiplier: number;
  bonus: number;
  finalXP: number;
  breakdown: MultiplierBreakdown[];
  fromFallback: boolean;
}

export interface MultiplierBreakdown {
  slug: string;
  title: string;
  type: string;
  value: number;
}

export interface EconomySetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: "string" | "number" | "boolean" | "json";
  description: string;
  updated_by: string | null;
  updated_at: string;
}
