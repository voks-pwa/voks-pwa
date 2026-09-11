import { supabase } from "@/lib/supabase";
import { updateProfile } from "./profileService";
import { findProfile } from "./profileRepository";
import { calculateLevel } from "@/features/xp/utils/level";

export async function updateBadge(
  userId: string,
  badge: string,
) {

  return updateProfile(userId,{
      badge_name:badge,
  });

}

export async function syncLevelBadge(userId: string) {
  try {
    const profile = await findProfile(userId);
    if (!profile) return;

    const level = calculateLevel(profile.lifetime_vxp ?? 0).level;

    const { data: badge, error: badgeError } = await supabase.rpc("calculate_badge_for_user", {
      p_user_id: userId,
    });

    if (badgeError) {
      console.warn("[PROFILE_BADGE] badge calculation failed:", badgeError.message);
      return;
    }

    await updateProfile(userId, {
      level,
      badge_name: (badge as string | null) ?? profile.badge_name ?? undefined,
    });
  } catch (error) {
    console.warn("[PROFILE_BADGE] sync skipped:", error instanceof Error ? error.message : error);
  }
}