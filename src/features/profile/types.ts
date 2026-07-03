export type UserRole =
  | "member"
  | "admin"
  | "superadmin";

export interface Profile {

  id: string;

  email: string;

  display_name: string | null;

  avatar_url: string | null;

  phone: string | null;

  city: string | null;

  gender: string | null;

  birth_date: string | null;

  bio: string | null;

  role: UserRole;

  level: number;

  current_vxp: number;

  lifetime_vxp: number;

  badge_name: string | null;

  referral_code: string | null;

  referred_by: string | null;

  completed_profile: boolean;

  profile_reward_claimed: boolean;

  created_at: string;

}

export interface UpdateProfileInput {

  display_name?: string;

  avatar_url?: string;

  phone?: string;

  city?: string;

  gender?: string;

  birth_date?: string;

  bio?: string;

}