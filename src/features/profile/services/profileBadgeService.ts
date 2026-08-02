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
  const profile = await findProfile(userId);
  if (!profile) return;

  const level = calculateLevel(profile.lifetime_vxp).level;

  const { data: badge } = await supabase.rpc("calculate_badge_for_user", {
    p_user_id: userId,
  });

  await updateProfile(userId, {
    level,
    badge_name: (badge as string | null) ?? profile.badge_name ?? undefined,
  });
}