export interface AdminUser {
  id: string;
  display_name: string | null;
  email: string;
  avatar_url: string | null;
  badge_name: string | null;
  role: "member" | "admin" | "superadmin" | "banned";
  level: number;
  current_vxp: number;
  lifetime_vxp: number;
  created_at: string;
  city: string | null;
  province: string | null;
  gender: string | null;
  phone_number: string | null;
  birthday: string | null;
  favorite_program: string | null;
  favorite_music: string | null;
  referral_code: string | null;
  referred_by: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  facebook: string | null;
  threads: string | null;
  website: string | null;
  profile_completed: boolean;
}

export interface UserDetailResponse {
  profile: AdminUser;
  stats: {
    missionCount: number;
    transactionCount: number;
    redemptionCount: number;
  };
  recentTransactions: {
    created_at: string;
    amount: number;
    transaction_type: string;
    reason: string;
  }[];
  recentMissions: {
    completed_at: string;
    mission_id: string;
    xp_earned: number;
  }[];
  recentRedemptions: {
    redeemed_at: string;
    reward_title: string;
    reward_cost: number;
    reward_status: string;
  }[];
}
