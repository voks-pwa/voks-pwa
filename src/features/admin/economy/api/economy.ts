import { supabase } from "@/lib/supabase";
import type { XpRule, XpMultiplier } from "@/features/economy/types";

export interface EconomyAdminConfig {
  CURRENCIES: string;
  VXP_EARNING_DAILY_CAP: number;
  VXP_SPENDING_DAILY_CAP: number;
  VXP_SPENDING_WEEKLY_CAP: number;
  VXP_SPENDING_MONTHLY_CAP: number;
  VXP_MIN_BALANCE_FOR_REDEMPTION: number;
  ECONOMY_VERSION: number;
}

export async function getAdminEconomyConfig(): Promise<EconomyAdminConfig> {
  const { data, error } = await supabase.rpc("get_economy_config");

  if (error) throw error;
  if (!data.success) throw new Error(data.error ?? "Failed to load economy config");

  const cfg = data.config as Record<string, string | number>;
  return {
    CURRENCIES: String(cfg.CURRENCIES ?? '["VXP"]'),
    VXP_EARNING_DAILY_CAP: Number(cfg.VXP_EARNING_DAILY_CAP ?? 200),
    VXP_SPENDING_DAILY_CAP: Number(cfg.VXP_SPENDING_DAILY_CAP ?? 500),
    VXP_SPENDING_WEEKLY_CAP: Number(cfg.VXP_SPENDING_WEEKLY_CAP ?? 2000),
    VXP_SPENDING_MONTHLY_CAP: Number(cfg.VXP_SPENDING_MONTHLY_CAP ?? 8000),
    VXP_MIN_BALANCE_FOR_REDEMPTION: Number(cfg.VXP_MIN_BALANCE_FOR_REDEMPTION ?? 100),
    ECONOMY_VERSION: Number(cfg.ECONOMY_VERSION ?? 1),
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

export async function getAdminXpRules(): Promise<XpRule[]> {
  const { data, error } = await supabase
    .from("xp_rules")
    .select("*")
    .order("priority", { ascending: false });

  if (error) throw error;
  return (data as XpRule[]) ?? [];
}

export async function updateAdminXpRule(
  slug: string,
  updates: Partial<Pick<XpRule, "base_xp" | "enabled">>,
): Promise<void> {
  const { error } = await supabase.rpc("admin_update_xp_rule", {
    p_slug: slug,
    p_updates: updates,
  });

  if (error) throw error;
}

export async function getAdminMultipliers(): Promise<XpMultiplier[]> {
  const { data, error } = await supabase
    .from("xp_multipliers")
    .select("*")
    .order("priority", { ascending: true });

  if (error) throw error;
  return (data as XpMultiplier[]) ?? [];
}

export async function updateAdminMultiplier(
  slug: string,
  updates: Partial<Pick<XpMultiplier, "multiplier" | "enabled" | "start_date" | "end_date">>,
): Promise<void> {
  const { error } = await supabase.rpc("admin_update_multiplier", {
    p_slug: slug,
    p_updates: updates,
  });

  if (error) throw error;
}
