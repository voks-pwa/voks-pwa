import { supabase } from "@/lib/supabase";
import { findProfile, findProfileByReferralCode } from "./profileRepository";
import type { UserBadge, UserStreak } from "@/features/retention/types";
import { getAdminPermissions } from "@/features/admin/shared/permissions";
import type { CanonicalUser } from "../types/canonical";

async function loadBadges(userId: string): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", userId)
    .order("earned_at", { ascending: true });

  if (error) {
    console.error("[CANONICAL USER] badges error", error.message);
    return [];
  }

  return (data as UserBadge[]) ?? [];
}

async function loadStreaks(userId: string): Promise<UserStreak[]> {
  const { data, error } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("[CANONICAL USER] streaks error", error.message);
    return [];
  }

  return (data as UserStreak[]) ?? [];
}

export async function getCanonicalUser(userId: string): Promise<CanonicalUser> {
  console.log("[CANONICAL USER] loaded", userId);

  const [profile, badges, streaks] = await Promise.all([
    findProfile(userId),
    loadBadges(userId),
    loadStreaks(userId),
  ]);

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
    wallet: {
      balance: profile.current_vxp,
      lifetime_vxp: profile.lifetime_vxp,
    },
    badges,
    streaks,
    created_at: profile.created_at,
    birthday: profile.birthday,
    gender: profile.gender,
    favorite_program: profile.favorite_program,
    favorite_music: profile.favorite_music,
    referred_by: profile.referred_by,
  };
}

export async function getCanonicalUserByReferralCode(code: string): Promise<CanonicalUser | null> {
  const profile = await findProfileByReferralCode(code);
  if (!profile) return null;
  return getCanonicalUser(profile.id);
}

export function refreshCanonicalUser(queryClient: { invalidateQueries: (opts: { queryKey: unknown[] }) => void }, userId: string | undefined) {
  if (!userId) return;
  console.log("[CANONICAL USER] refreshed", userId);
  queryClient.invalidateQueries({ queryKey: ["canonical-user", userId] });
}
