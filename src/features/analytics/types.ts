export interface WalletAnalytics {
  minted: number;
  spent: number;
  net: number;
  transactions: number;
  active_wallets: number;
}

export interface CampaignAnalytics {
  total_campaigns: number;
  active_campaigns: number;
  rewards_granted: number;
  participants: number;
  vxp_distributed: number;
  recent_rewards: number;
}

export interface CommerceKpis {
  revenue: number;
  orders: number;
  fulfillments: number;
  refunds: number;
  active_subscriptions: number;
  wallet_minted: number;
  wallet_spent: number;
  campaign_participants: number;
}

export interface AnalyticsResult<T> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface UserAnalytics {
  total_users: number;
  new_users: number;
  active_users: number;
  verified_users: number;
  users_by_province: Record<string, number>;
  users_by_gender: Record<string, number>;
  daily_signups: Record<string, number>;
}

export interface MissionAnalytics {
  total_missions: number;
  active_missions: number;
  completed_count: number;
  completers: number;
  xp_awarded: number;
  completion_rate: number;
  top_missions: Array<{ id: number; title: string; completions: number }>;
  daily_completions: Record<string, number>;
}

export interface AnalyticsDateRange {
  from: string;
  to: string;
}

export interface ReportExport {
  rows: Record<string, unknown>[];
  columns: { key: string; label: string }[];
}
