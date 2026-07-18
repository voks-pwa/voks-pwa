import { getRewards } from "@/services/wordpress-api";
import { upsertRewardCatalog, updateRewardOperational } from "../repositories/rewardSyncRepository";
import { seedOrUpdateInventory } from "@/features/inventory/services/inventoryEngine";
import type { WPReward } from "../rewardTypes";

function wpToCatalogEntry(wp: WPReward) {
  return {
    id: wp.id,
    slug: wp.slug,
    title: wp.title?.rendered ?? wp.acf?.reward_name ?? "",
    subtitle: wp.acf?.reward_subtitle ?? null,
    description: wp.acf?.reward_description ?? null,
    image_url: wp.image_url ?? null,
    delivery_type: wp.acf?.reward_delivery_type ?? "digital",
    reward_category: wp.acf?.reward_code_type ?? "",
    sponsor: wp.acf?.reward_badge ?? null,
    terms: wp.acf?.reward_terms ?? null,
    delivery_notes: wp.acf?.reward_delivery_notes ?? null,
    bonus_vxp: wp.acf?.reward_bonus_vxp ?? 0,
    campaign_slug: wp.acf?.reward_campaign_slug ?? null,
    required_badge: wp.acf?.reward_required_badge ?? null,
    required_achievement: wp.acf?.reward_required_achievement ?? null,
    vip_only: wp.acf?.reward_vip_only ?? false,
    synced_at: null,
    created_at: "",
    updated_at: "",
  };
}

export async function syncAll(): Promise<{ catalog: number; inventory: number; failed: boolean }> {
  let catalogCount = 0;
  let inventoryCount = 0;
  let failed = false;

  try {
    const wpRewards = await getRewards();
    const entries = wpRewards.map(wpToCatalogEntry);

    await upsertRewardCatalog(entries);
    catalogCount = entries.length;

    let seeded = 0;
    for (const wp of wpRewards) {
      const stock = wp.acf?.reward_stock ?? 0;
      const warning = Math.max(1, Math.round(stock * 0.2));
      try {
        await seedOrUpdateInventory(wp.id, stock, warning, stock > 0 ? "limited" : "unlimited");
        seeded++;
      } catch {
        // skip per-item failure
      }
    }
    inventoryCount = seeded;
  } catch {
    failed = true;
  }

  return { catalog: catalogCount, inventory: inventoryCount, failed };
}

export async function toggleRewardActive(
  id: number,
  active: boolean,
): Promise<void> {
  await updateRewardOperational(id, { reward_active: active });
}

export async function updateRewardCost(
  id: number,
  cost: number,
): Promise<void> {
  await updateRewardOperational(id, { cost });
}

export async function updateRewardFeatured(
  id: number,
  featured: boolean,
): Promise<void> {
  await updateRewardOperational(id, { featured });
}

export async function updateRewardPriority(
  id: number,
  priority: number,
): Promise<void> {
  await updateRewardOperational(id, { priority });
}
