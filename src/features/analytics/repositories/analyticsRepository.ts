import { supabase } from "@/lib/supabase";
import type { WalletAnalytics, CampaignAnalytics, CommerceKpis } from "../types";

export async function getWalletAnalyticsRpc(days: number = 30): Promise<WalletAnalytics> {
  const { data, error } = await supabase.rpc("get_wallet_analytics", { p_days: days });
  if (error) throw error;
  const result = data as unknown as { success: boolean; error?: string } & WalletAnalytics;
  if (!result.success) throw new Error(result.error ?? "get_wallet_analytics failed");
  return result as WalletAnalytics;
}

export async function getCampaignAnalyticsRpc(days: number = 30): Promise<CampaignAnalytics> {
  const { data, error } = await supabase.rpc("get_campaign_analytics", { p_days: days });
  if (error) throw error;
  const result = data as unknown as { success: boolean; error?: string } & CampaignAnalytics;
  if (!result.success) throw new Error(result.error ?? "get_campaign_analytics failed");
  return result as CampaignAnalytics;
}

export async function getCommerceKpisRpc(days: number = 30): Promise<CommerceKpis> {
  const { data, error } = await supabase.rpc("get_commerce_kpis", { p_days: days });
  if (error) throw error;
  const result = data as unknown as { success: boolean; error?: string } & CommerceKpis;
  if (!result.success) throw new Error(result.error ?? "get_commerce_kpis failed");
  return result as CommerceKpis;
}

export async function getAdminAnalytics(days: number = 30): Promise<unknown> {
  const { data, error } = await supabase.functions.invoke("admin-analytics", { body: { days } });
  if (error) throw error;
  if (!(data as Record<string, unknown>).success) {
    throw new Error((data as Record<string, unknown>).error as string ?? "admin-analytics failed");
  }
  return (data as Record<string, unknown>).data;
}
