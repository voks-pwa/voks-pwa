import type { AdminPermission } from "@/features/admin/shared/permissions";
import type { UserRole } from "../types";
import type { UserBadge, UserStreak } from "@/features/retention/types";

export interface CanonicalWallet {
  balance: number;
  lifetime_vxp: number;
}

export interface CanonicalUser {
  id: string;
  email: string;
  avatar_url: string | null;
  display_name: string | null;
  role: UserRole;
  status: "active" | "banned" | "inactive";
  current_vxp: number;
  lifetime_vxp: number;
  level: number;
  badge: string | null;
  profile_completed: boolean;
  referral_code: string | null;
  referral_url: string | null;
  phone: string | null;
  city: string | null;
  province: string | null;
  social: {
    instagram: string | null;
    tiktok: string | null;
    youtube: string | null;
    facebook: string | null;
    threads: string | null;
    website: string | null;
  };
  permissions: AdminPermission[];
  wallet: CanonicalWallet;
  badges: UserBadge[];
  streaks: UserStreak[];
  created_at: string;
  birthday: string | null;
  gender: string | null;
  favorite_program: string | null;
  favorite_music: string | null;
  referred_by: string | null;
}
