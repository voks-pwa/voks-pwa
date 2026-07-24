import { supabase } from "@/lib/supabase";
import type { UserAchievement } from "../types";

export async function getCatalogCount(): Promise<number | null> {
  const { count, error } = await supabase
    .from("achievements")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("[ACHIEVEMENT] count error", error);
    return null;
  }

  return count;
}

export async function upsertAchievementCatalogItem(item: {
  slug: string;
  title: string;
  description: string;
  badge_icon: string;
  badge_name: string;
  tier: string;
  reward_vxp: number;
  trigger_type: string;
  trigger_key: string;
  target_value: number;
}): Promise<void> {
  const { error } = await supabase.from("achievements").upsert(
    {
      slug: item.slug,
      title: item.title,
      description: item.description,
      badge_icon: item.badge_icon,
      badge_name: item.badge_name,
      tier: item.tier,
      reward_vxp: item.reward_vxp,
      trigger_type: item.trigger_type,
      trigger_key: item.trigger_key,
      target_value: item.target_value,
      active: true,
    },
    {
      onConflict: "slug",
      ignoreDuplicates: true,
    },
  );

  if (error) {
    console.error(`[ACHIEVEMENT] seed failed for ${item.slug}`, error);
  }
}

export async function getCatalog(): Promise<
  Array<{
    id: number;
    slug: string;
    title: string;
    description: string | null;
    badge_icon: string | null;
    badge_name: string;
    tier: string;
    reward_vxp: number;
    trigger_type: string;
    trigger_key: string | null;
    target_value: number;
    active: boolean;
  }>
> {
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .eq("active", true);

  if (error) {
    console.error("[ACHIEVEMENT] catalog error", error);
    console.error("[ACHIEVEMENT] catalog error detail", JSON.stringify(error, null, 2));
    return [];
  }

  return data ?? [];
}

export async function getEarnedAchievements(
  userId: string,
): Promise<UserAchievement[]> {
  const { data, error } = await supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("[ACHIEVEMENT] earned read error", error);
    console.error("[ACHIEVEMENT] earned read error detail", JSON.stringify(error, null, 2));
    return [];
  }

  return (data as UserAchievement[]) ?? [];
}

export async function upsertUserAchievement(
  userId: string,
  achievementId: number,
  values: { progress: number; earned_at: string; reward_vxp: number },
): Promise<UserAchievement | null> {
  const { data, error } = await supabase
    .from("user_achievements")
    .upsert(
      {
        user_id: userId,
        achievement_id: achievementId,
        progress: values.progress,
        earned_at: values.earned_at,
        reward_vxp: values.reward_vxp,
      },
      {
        onConflict: "user_id,achievement_id",
        ignoreDuplicates: false,
      },
    )
    .select()
    .maybeSingle();

  if (error) {
    console.error("[ACHIEVEMENT] upsert error", error);
    console.error("[ACHIEVEMENT] upsert error detail", JSON.stringify(error, null, 2));
    return null;
  }

  return data as UserAchievement;
}
