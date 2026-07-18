import { supabase } from "@/lib/supabase";
import type { AchievementCatalogItem, AchievementMetric } from "../types";

export const ACHIEVEMENT_CATALOG: AchievementCatalogItem[] = [
  {
    slug: "profile-identity",
    title: "Identitas Diri",
    description: "Lengkapi profil kamu sampai 100%.",
    badge_icon: "user-check",
    badge_name: "Identitas Lengkap",
    tier: "bronze",
    reward_vxp: 50,
    trigger_type: "profile",
    trigger_key: "profile_complete",
    target_value: 1,
    metric: "profile_complete",
  },
  {
    slug: "social-butterfly",
    title: "Kupu-Kupu Sosial",
    description: "Bagikan aplikasi VOKS NEXT sebanyak 10 kali.",
    badge_icon: "share-2",
    badge_name: "Penyebar Kabar",
    tier: "silver",
    reward_vxp: 80,
    trigger_type: "share",
    trigger_key: "share_count",
    target_value: 10,
    metric: "share_count",
  },
  {
    slug: "connector",
    title: "Penghubung",
    description: "Ajak 1 teman bergabung lewat referral.",
    badge_icon: "users",
    badge_name: "Ajakan Pertama",
    tier: "bronze",
    reward_vxp: 60,
    trigger_type: "referral",
    trigger_key: "referral_count",
    target_value: 1,
    metric: "referral_count",
  },
  {
    slug: "networker",
    title: "Jaringan Luas",
    description: "Ajak 5 teman bergabung lewat referral.",
    badge_icon: "git-network",
    badge_name: "Master Referral",
    tier: "gold",
    reward_vxp: 200,
    trigger_type: "referral",
    trigger_key: "referral_count",
    target_value: 5,
    metric: "referral_count",
  },
  {
    slug: "listener-1",
    title: "Pendengar Setia",
    description: "Dengarkan radio selama 60 menit.",
    badge_icon: "headphones",
    badge_name: "Pecinta Frekuensi",
    tier: "bronze",
    reward_vxp: 50,
    trigger_type: "listen",
    trigger_key: "listen_minutes",
    target_value: 60,
    metric: "listen_minutes",
  },
  {
    slug: "listener-2",
    title: "Pecandu Radio",
    description: "Dengarkan radio selama 300 menit.",
    badge_icon: "radio",
    badge_name: "Radio Maniac",
    tier: "gold",
    reward_vxp: 150,
    trigger_type: "listen",
    trigger_key: "listen_minutes",
    target_value: 300,
    metric: "listen_minutes",
  },
  {
    slug: "daily-devotion",
    title: "Istiqomah Harian",
    description: "Capai streak harian 7 hari.",
    badge_icon: "flame",
    badge_name: "7 Hari Berturut",
    tier: "silver",
    reward_vxp: 100,
    trigger_type: "streak",
    trigger_key: "current_streak",
    target_value: 7,
    metric: "current_streak",
  },
  {
    slug: "mission-runner",
    title: "Mission Runner",
    description: "Selesaikan dan klaim 10 mission.",
    badge_icon: "trophy",
    badge_name: "Mission Runner",
    tier: "silver",
    reward_vxp: 120,
    trigger_type: "mission",
    trigger_key: "claimed_mission_count",
    target_value: 10,
    metric: "claimed_mission_count",
  },
];

export async function ensureAchievementCatalog(): Promise<void> {
  const { count, error: countError } = await supabase
    .from("achievements")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("[ACHIEVEMENT] count error", countError);
    console.error("[ACHIEVEMENT] count error detail", JSON.stringify(countError, null, 2));
    return;
  }

  if (count && count >= ACHIEVEMENT_CATALOG.length) return;

  for (const item of ACHIEVEMENT_CATALOG) {
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
      console.error(`[ACHIEVEMENT] seed error detail`, JSON.stringify(error, null, 2));
    }
  }
}

export interface AchievementMetricReader {
  (metric: AchievementMetric, userId: string): Promise<number>;
}

export const ACHIEVEMENT_METRICS: AchievementMetric[] = [
  "profile_complete",
  "share_count",
  "referral_count",
  "listen_minutes",
  "current_streak",
  "claimed_mission_count",
];
