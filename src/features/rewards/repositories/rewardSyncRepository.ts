import { supabase } from "@/lib/supabase";

export interface RewardCatalogRow {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  delivery_type: string | null;
  reward_category: string | null;
  sponsor: string | null;
  terms: string | null;
  delivery_notes: string | null;
  bonus_vxp: number;
  campaign_slug: string | null;
  required_badge: string | null;
  required_achievement: string | null;
  vip_only: boolean;
  cost: number;
  featured: boolean;
  priority: number;
  reward_active: boolean;
  max_per_user: number;
  synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export type CatalogMetadata = Pick<
  RewardCatalogRow,
  "id" | "slug" | "title" | "subtitle" | "description" | "image_url" | "delivery_type" | "reward_category" | "sponsor" | "terms" | "delivery_notes" | "bonus_vxp" | "campaign_slug" | "required_badge" | "required_achievement" | "vip_only" | "synced_at"
>;

export async function upsertRewardCatalog(
  rewards: CatalogMetadata[],
): Promise<void> {
  if (rewards.length === 0) return;

  const { error } = await supabase.from("reward_catalog").upsert(
    rewards.map((r) => ({ ...r, synced_at: new Date().toISOString() })),
    { onConflict: "id", ignoreDuplicates: false },
  );

  if (error) throw error;
}

export async function getAllRewardCatalog(): Promise<RewardCatalogRow[]> {
  const { data, error } = await supabase
    .from("reward_catalog")
    .select("*")
    .order("priority", { ascending: true })
    .order("title", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getRewardCatalogById(
  id: number,
): Promise<RewardCatalogRow | null> {
  const { data, error } = await supabase
    .from("reward_catalog")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getRewardCatalogBySlug(
  slug: string,
): Promise<RewardCatalogRow | null> {
  const { data, error } = await supabase
    .from("reward_catalog")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateRewardOperational(
  id: number,
  fields: Partial<Pick<RewardCatalogRow, "cost" | "featured" | "priority" | "reward_active" | "max_per_user">>,
): Promise<void> {
  const { error } = await supabase
    .from("reward_catalog")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function getActiveRewardCatalog(): Promise<RewardCatalogRow[]> {
  const { data, error } = await supabase
    .from("reward_catalog")
    .select("*")
    .eq("reward_active", true)
    .order("priority", { ascending: true })
    .order("title", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
