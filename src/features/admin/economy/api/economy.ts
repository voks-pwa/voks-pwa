import { supabase } from "@/lib/supabase";
import { getEconomyConfig, getAllXpRules, getAllMultipliers, updateXpRule, updateMultiplier } from "@/features/economy/repositories/economyRepository";
import type { EconomyAdminConfig } from "./types";

export async function getAdminEconomyConfig(): Promise<EconomyAdminConfig> {
  const config = await getEconomyConfig();

  return {
    CURRENCIES: JSON.stringify(config?.CURRENCIES ?? ["VXP"]),
    VXP_EARNING_DAILY_CAP: config?.VXP_EARNING_DAILY_CAP ?? 200,
    VXP_SPENDING_DAILY_CAP: config?.VXP_SPENDING_DAILY_CAP ?? 500,
    VXP_SPENDING_WEEKLY_CAP: config?.VXP_SPENDING_WEEKLY_CAP ?? 2000,
    VXP_SPENDING_MONTHLY_CAP: config?.VXP_SPENDING_MONTHLY_CAP ?? 8000,
    VXP_MIN_BALANCE_FOR_REDEMPTION: config?.VXP_MIN_BALANCE_FOR_REDEMPTION ?? 100,
    ECONOMY_VERSION: config?.ECONOMY_VERSION ?? 1,
  };
}

export async function updateEconomyConfig(
  updates: Partial<Omit<EconomyAdminConfig, "ECONOMY_VERSION">>,
): Promise<void> {
  const payload: Record<string, string> = {};
  for (const [key, value] of Object.entries(updates)) {
    payload[key] = String(value);
  }

  const { error } = await supabase.rpc("admin_update_economy_config", {
    p_updates: payload,
  });

  if (error) throw error;
}

export async function getAdminXpRules() {
  return getAllXpRules();
}

export async function updateAdminXpRule(
  slug: string,
  updates: Parameters<typeof updateXpRule>[1],
): Promise<void> {
  await updateXpRule(slug, updates);
}

export async function getAdminMultipliers() {
  return getAllMultipliers();
}

export async function updateAdminMultiplier(
  slug: string,
  updates: Parameters<typeof updateMultiplier>[1],
): Promise<void> {
  await updateMultiplier(slug, updates);
}
