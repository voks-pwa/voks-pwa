import type {
  RewardAnalyticsResponse,
  RedeemTrendPoint,
  WalletTrendPoint,
  TopRewardRow,
  LowStockItem,
  RewardInventoryItem,
} from "../types";

export function buildRedeemTrend(data: RewardAnalyticsResponse | undefined): RedeemTrendPoint[] {
  if (!data?.redeems?.trend) return [];
  return Object.entries(data.redeems.trend)
    .map(([date, redeems]) => ({ date, redeems }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function buildWalletBurnTrend(data: RewardAnalyticsResponse | undefined): WalletTrendPoint[] {
  if (!data?.wallet?.burnTrend) return [];
  return Object.entries(data.wallet.burnTrend)
    .map(([date, vxp]) => ({ date, vxp }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function buildTopRewardsList(data: RewardAnalyticsResponse | undefined): TopRewardRow[] {
  if (!data?.redeems?.topRewards) return [];
  return Object.entries(data.redeems.topRewards).map(([name, redeems]) => ({ name, redeems }));
}

export function buildLowStockItems(data: RewardAnalyticsResponse | undefined): LowStockItem[] {
  if (!data?.inventory?.items) return [];
  return data.inventory.items
    .filter((i: RewardInventoryItem) => {
      const stock = Number(i.current_stock);
      const warning = Number(i.warning_stock);
      return stock <= warning;
    })
    .map((i: RewardInventoryItem) => ({
      reward_id: i.reward_id,
      current_stock: Number(i.current_stock),
      warning_stock: Number(i.warning_stock),
      status: (Number(i.current_stock) <= 0 ? "critical" : "warning") as "warning" | "critical",
    }))
    .sort((a: LowStockItem, b: LowStockItem) => a.current_stock - b.current_stock);
}

export function buildStatusBreakdown(data: RewardAnalyticsResponse | undefined): Record<string, number> {
  if (!data?.redeems?.statusBreakdown) return {};
  return data.redeems.statusBreakdown;
}

export function buildVoucherBreakdown(data: RewardAnalyticsResponse | undefined): Record<string, number> {
  if (!data?.vouchers) return {};
  return {
    Available: data.vouchers.available,
    Assigned: data.vouchers.assigned,
    Used: data.vouchers.used,
    Expired: data.vouchers.expired,
    Void: data.vouchers.void,
  };
}
