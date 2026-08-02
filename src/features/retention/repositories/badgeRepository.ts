import { supabase } from "@/lib/supabase";
import type { UserBadge } from "../types";

export interface XpBadgeDefinition {
  id: number;
  slug: string;
  title: string;
  description: string;
  min_lifetime_vxp: number;
  min_role: string | null;
  icon_url: string;
  sort_order: number;
}

export async function getXpBadgeDefinitions(): Promise<XpBadgeDefinition[]> {
  const { data, error } = await supabase.rpc("get_xp_badges");

  if (error) {
    console.error("[BADGE] get_xp_badges error", error.message);
    return [];
  }

  return (data as XpBadgeDefinition[]) ?? [];
}

export async function getBadges(userId: string): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", userId)
    .order("earned_at", { ascending: true });

  if (error) {
    console.error("[BADGE] read error", error);
    console.error("[BADGE] read error detail", JSON.stringify(error, null, 2));
    return [];
  }

  return (data as UserBadge[]) ?? [];
}

export async function grantBadge(
  userId: string,
  badge: Omit<UserBadge, "id" | "earned_at" | "user_id">,
): Promise<UserBadge | null> {
  const { data, error } = await supabase
    .from("user_badges")
    .upsert(
      {
        user_id: userId,
        badge_key: badge.badge_key,
        badge_name: badge.badge_name,
        badge_icon: badge.badge_icon,
        source: badge.source,
        source_id: badge.source_id,
      },
      {
        onConflict: "user_id,badge_key",
        ignoreDuplicates: true,
      },
    )
    .select()
    .maybeSingle();

  if (error) {
    console.error("[BADGE] grant error", error);
    console.error("[BADGE] grant error detail", JSON.stringify(error, null, 2));
    return null;
  }

  return data as UserBadge;
}
