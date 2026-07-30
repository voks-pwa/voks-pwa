export type UserRole =
  | "member"
  | "admin"
  | "superadmin"
  | "banned";

export interface Profile {
  id: string;
  email: string;

  full_name: string | null;
  display_name: string | null;
  bio: string | null;
  phone_number: string | null;
  /** @deprecated Use phone_number */
  phone: string | null;
  avatar_url: string | null;
  avatar_asset_id: string | null;

  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  facebook: string | null;
  threads: string | null;
  website: string | null;

  birthday: string | null;
  /** @deprecated Use birthday */
  birth_date: string | null;
  gender: string | null;
  city: string | null;
  province: string | null;
  favorite_program: string | null;
  favorite_music: string | null;

  profile_completed: boolean;
  /** @deprecated Use profile_completed */
  completed_profile: boolean;
  profile_reward_claimed: boolean;

  level: number;
  current_vxp: number;
  lifetime_vxp: number;
  badge_name: string | null;
  role: UserRole;
  referral_code: string | null;
  referred_by: string | null;

  created_at: string;
  updated_at: string | null;
}

export interface UpdateProfileInput {
  full_name?: string;
  display_name?: string;
  bio?: string;
  phone_number?: string;
  avatar_url?: string;
  avatar_asset_id?: string;

  instagram?: string;
  tiktok?: string;
  youtube?: string;
  facebook?: string;
  threads?: string;
  website?: string;

  birthday?: string;
  gender?: string;
  city?: string;
  province?: string;
  favorite_program?: string;
  favorite_music?: string;

  referral_code?: string;
  referred_by?: string | null;

  profile_completed?: boolean;
  profile_reward_claimed?: boolean;
  badge_name?: string;
}
