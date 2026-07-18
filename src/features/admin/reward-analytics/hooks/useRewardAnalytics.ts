import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRewardAnalytics } from "../repositories/rewardAnalyticsRepository";
import {
  buildRedeemTrend,
  buildWalletBurnTrend,
  buildTopRewardsList,
  buildLowStockItems,
  buildStatusBreakdown,
  buildVoucherBreakdown,
} from "../services/rewardAnalyticsService";
import { rewardAnalyticsKeys } from "../queries/rewardAnalyticsQueries";

export function useRewardAnalytics(days: number = 30) {
  const query = useQuery({
    queryKey: rewardAnalyticsKeys.byDays(days),
    queryFn: () => getRewardAnalytics(days),
    staleTime: 60_000,
    refetchInterval: 30_000,
  });

  const redeemTrend = useMemo(() => buildRedeemTrend(query.data), [query.data]);
  const walletBurnTrend = useMemo(() => buildWalletBurnTrend(query.data), [query.data]);
  const topRewards = useMemo(() => buildTopRewardsList(query.data), [query.data]);
  const lowStockItems = useMemo(() => buildLowStockItems(query.data), [query.data]);
  const statusBreakdown = useMemo(() => buildStatusBreakdown(query.data), [query.data]);
  const voucherBreakdown = useMemo(() => buildVoucherBreakdown(query.data), [query.data]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    overview: query.data?.overview ?? null,
    redeems: query.data?.redeems ?? null,
    wallet: query.data?.wallet ?? null,
    inventory: query.data?.inventory ?? null,
    vouchers: query.data?.vouchers ?? null,
    shipping: query.data?.shipping ?? null,
    redeemTrend,
    walletBurnTrend,
    topRewards,
    lowStockItems,
    statusBreakdown,
    voucherBreakdown,
  };
}
