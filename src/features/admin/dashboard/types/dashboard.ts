export interface DashboardStats {
  users: number;
  transactions: number;
  completedMissions: number;
  rewardRedemptions: number;
  missionsToday: number;
  redemptionsToday: number;
  usersThisWeek: number;
  usersThisMonth: number;
  pendingBroadcasts: number;
  currentListeners: number;
  totalBroadcasts: number;
  totalNotifications: number;
  totalRewards: number;
  totalMissionsCompleted: number;
  podcastCount: number;
  promoCount: number;
}

export interface TopUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  badge_name: string | null;
  level: number;
  lifetime_vxp: number;
}

export interface RecentActivityItem {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  reason: string;
  reference_id: string | null;
  created_at: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface DashboardResponse {
  success: boolean;
  stats: DashboardStats;
  topUsers: TopUser[];
  recentActivity: RecentActivityItem[];
  generated_at: string;
}
