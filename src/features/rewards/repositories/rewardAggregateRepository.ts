import { supabase } from "@/lib/supabase";
import { getAllInventory } from "@/features/inventory/repositories/inventoryRepository";
import type { RewardAggregate } from "../types/rewardAggregate";
import type { RewardCatalogRow } from "./rewardSyncRepository";

function mergeCatalogWithInventory(
  catalogRows: RewardCatalogRow[],
  inventoryMap: Map<number, { stock: number; reserved: number; mode: string; warning: number }>,
): RewardAggregate[] {
  return catalogRows.map((row) => {
    const inv = inventoryMap.get(row.id);
    const stock = inv?.stock ?? 0;
    const reserved = inv?.reserved ?? 0;
    const available = inv ? stock - reserved : 0;

    return {
      id: row.id,
      slug: row.slug,
      name: row.title,
      subtitle: row.subtitle ?? "",
      description: row.description ?? "",
      image_url: row.image_url ?? "",
      sponsor: row.sponsor ?? "",
      category: row.reward_category ?? "",
      campaign_slug: row.campaign_slug ?? "",
      cost: row.cost,
      featured: row.featured,
      priority: row.priority,
      reward_active: row.reward_active,
      max_per_user: row.max_per_user,
      delivery_type: row.delivery_type ?? "digital",
      terms: row.terms ?? "",
      delivery_notes: row.delivery_notes ?? "",
      bonus_vxp: row.bonus_vxp,
      required_badge: row.required_badge ?? "",
      required_achievement: row.required_achievement ?? "",
      vip_only: row.vip_only,
      expired_at: "",
      created_at: row.created_at,
      inventory_mode: (inv?.mode ?? "limited") as "limited" | "unlimited",
      stock,
      reserved,
      available,
      voucher_available: 0,
      voucher_used: 0,
      total_redeems: 0,
    };
  });
}

export async function getRewardAggregate(): Promise<RewardAggregate[]> {
  const { data: catalogRows, error: catalogError } = await supabase
    .from("reward_catalog")
    .select("*")
    .order("priority", { ascending: true })
    .order("title", { ascending: true });

  if (catalogError) throw catalogError;
  if (!catalogRows?.length) return [];

  const inventoryRecords = await getAllInventory();
  const inventoryMap = new Map<number, { stock: number; reserved: number; mode: string; warning: number }>();
  for (const inv of inventoryRecords) {
    inventoryMap.set(inv.reward_id, {
      stock: inv.current_stock,
      reserved: inv.reserved_stock,
      mode: inv.inventory_mode,
      warning: inv.warning_stock,
    });
  }

  return mergeCatalogWithInventory(catalogRows, inventoryMap);
}

export async function getActiveRewardAggregate(): Promise<RewardAggregate[]> {
  const all = await getRewardAggregate();
  return all.filter((r) => r.reward_active);
}

export async function getRewardAggregateBySlug(slug: string): Promise<RewardAggregate | null> {
  const { data: row, error } = await supabase
    .from("reward_catalog")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!row) return null;

  const inventoryRecords = await getAllInventory();
  const inventoryMap = new Map<number, { stock: number; reserved: number; mode: string; warning: number }>();
  for (const inv of inventoryRecords) {
    inventoryMap.set(inv.reward_id, {
      stock: inv.current_stock,
      reserved: inv.reserved_stock,
      mode: inv.inventory_mode,
      warning: inv.warning_stock,
    });
  }

  const merged = mergeCatalogWithInventory([row], inventoryMap);
  return merged[0] ?? null;
}
