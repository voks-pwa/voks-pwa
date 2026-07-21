import { useQuery } from "@tanstack/react-query";
import {
  getWalletAnalyticsRpc,
  getCampaignAnalyticsRpc,
  getCommerceKpisRpc,
  getUserAnalyticsRpc,
  getMissionAnalyticsRpc,
  getAdminAnalytics,
} from "../repositories/analyticsRepository";
import { analyticsKeys } from "../queries/analyticsQueries";
import type { WalletAnalytics, CampaignAnalytics, CommerceKpis } from "../types";

export function useWalletAnalytics(days: number = 30) {
  return useQuery<WalletAnalytics>({
    queryKey: analyticsKeys.wallet(days),
    queryFn: () => getWalletAnalyticsRpc(days),
    staleTime: 60_000,
    refetchInterval: 30_000,
  });
}

export function useCampaignAnalytics(days: number = 30) {
  return useQuery<CampaignAnalytics>({
    queryKey: analyticsKeys.campaign(days),
    queryFn: () => getCampaignAnalyticsRpc(days),
    staleTime: 60_000,
    refetchInterval: 30_000,
  });
}

export function useCommerceKpis(days: number = 30) {
  return useQuery<CommerceKpis>({
    queryKey: analyticsKeys.commerceKpis(days),
    queryFn: () => getCommerceKpisRpc(days),
    staleTime: 60_000,
    refetchInterval: 30_000,
  });
}

export function useUserAnalytics(days: number = 30) {
  return useQuery({
    queryKey: analyticsKeys.user(days),
    queryFn: () => getUserAnalyticsRpc(days),
    staleTime: 60_000,
  });
}

export function useMissionAnalytics(days: number = 30) {
  return useQuery({
    queryKey: analyticsKeys.mission(days),
    queryFn: () => getMissionAnalyticsRpc(days),
    staleTime: 60_000,
  });
}

export function useAdminAnalytics(days: number = 30) {
  return useQuery({
    queryKey: analyticsKeys.admin(days),
    queryFn: () => getAdminAnalytics(days),
    staleTime: 60_000,
    refetchInterval: 30_000,
  });
}
