import type { RewardCatalogRow } from "../repositories/rewardSyncRepository";
import type { Reward } from "../rewardTypes";

export function catalogRowToReward(row: RewardCatalogRow): Reward {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? "",
    description: row.description ?? "",
    cost: row.cost,
    stock: 0,
    image: row.image_url ?? undefined,
    active: row.reward_active,
    featured: row.featured,
    status: row.reward_active ? "active" : "inactive",
    badge: row.sponsor ?? undefined,
    color: "",
    deliveryType: row.delivery_type ?? "digital",
    deliveryNotes: row.delivery_notes ?? undefined,
    terms: row.terms ?? undefined,
    codeType: row.reward_category ?? "",
    expiredAt: undefined,
    priority: row.priority,
    maxPerUser: row.max_per_user,
    bonusVxp: row.bonus_vxp,
    campaignSlug: row.campaign_slug ?? undefined,
    requiredBadge: row.required_badge ?? undefined,
    requiredAchievement: row.required_achievement ?? undefined,
    vipOnly: row.vip_only,
  };
}

export function catalogRowsToRewards(rows: RewardCatalogRow[]): Reward[] {
  return rows.map(catalogRowToReward);
}
