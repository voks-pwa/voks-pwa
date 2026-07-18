import type { AdminPermission } from "@/features/admin/shared/permissions";
import type { UserRole } from "../types";

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
}
