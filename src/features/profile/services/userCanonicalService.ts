import { findProfile, findProfileByReferralCode } from "./profileRepository";
import { getAdminPermissions } from "@/features/admin/shared/permissions";
import type { CanonicalUser } from "../types/canonical";

export async function getCanonicalUser(userId: string): Promise<CanonicalUser> {
  const profile = await findProfile(userId);
  if (!profile) {
    throw new Error(`Profile not found for user ${userId}`);
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return {
    id: profile.id,
    email: profile.email,
    avatar_url: profile.avatar_url,
    display_name: profile.display_name,
    role: profile.role,
    status: profile.role === "banned" ? "banned" : "active",
    current_vxp: profile.current_vxp,
    lifetime_vxp: profile.lifetime_vxp,
    level: profile.level,
    badge: profile.badge_name,
    profile_completed: profile.profile_completed,
    referral_code: profile.referral_code,
    referral_url: profile.referral_code ? `${origin}/ref/${profile.referral_code}` : null,
    phone: profile.phone_number,
    city: profile.city,
    province: profile.province,
    social: {
      instagram: profile.instagram,
      tiktok: profile.tiktok,
      youtube: profile.youtube,
      facebook: profile.facebook,
      threads: profile.threads,
      website: profile.website,
    },
    permissions: getAdminPermissions(profile.role),
  };
}

export async function getCanonicalUserByReferralCode(code: string): Promise<CanonicalUser | null> {
  const profile = await findProfileByReferralCode(code);
  if (!profile) return null;
  return getCanonicalUser(profile.id);
}
