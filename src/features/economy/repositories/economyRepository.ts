import { supabase } from "@/lib/supabase";
import type { EconomyConfig, SpendingLimitResult, CurrencyType, XpRule, XpMultiplier } from "../types";

export async function getEconomyConfig(): Promise<EconomyConfig | null> {
  const { data, error } = await supabase.rpc("get_economy_config");

  if (error) {
    console.error("[ECONOMY REPO] get_economy_config error", error.message);
    return null;
  }

  const result = data as { success: boolean; config: Record<string, string | string[]> };
  if (!result.success) return null;

  const cfg = result.config;
  return {
    CURRENCIES: (cfg.CURRENCIES ?? ["VXP"]) as CurrencyType[],
    VXP_EARNING_DAILY_CAP: Number(cfg.VXP_EARNING_DAILY_CAP ?? 200),
    VXP_SPENDING_DAILY_CAP: Number(cfg.VXP_SPENDING_DAILY_CAP ?? 500),
    VXP_SPENDING_WEEKLY_CAP: Number(cfg.VXP_SPENDING_WEEKLY_CAP ?? 2000),
    VXP_SPENDING_MONTHLY_CAP: Number(cfg.VXP_SPENDING_MONTHLY_CAP ?? 8000),
    VXP_MIN_BALANCE_FOR_REDEMPTION: Number(cfg.VXP_MIN_BALANCE_FOR_REDEMPTION ?? 100),
    ECONOMY_VERSION: Number(cfg.ECONOMY_VERSION ?? 1),
  };
}

export async function checkSpendingLimit(
  userId: string,
  amount: number,
  currencyType: CurrencyType = "VXP",
): Promise<SpendingLimitResult | null> {
  const { data, error } = await supabase.rpc("check_spending_limit", {
    p_user_id: userId,
    p_amount: amount,
    p_currency_type: currencyType,
  });

  if (error) {
    console.error("[ECONOMY REPO] check_spending_limit error", error.message);
    return null;
  }

  const result = data as {
    success: boolean;
    allowed: boolean;
    daily: SpendingLimitResult["daily"];
    weekly: SpendingLimitResult["weekly"];
    monthly: SpendingLimitResult["monthly"];
    proposed: number;
    would_exceed: string | null;
  };

  if (!result.success) return null;

  return {
    allowed: result.allowed,
    daily: result.daily,
    weekly: result.weekly,
    monthly: result.monthly,
    proposed: result.proposed,
    wouldExceed: result.would_exceed as SpendingLimitResult["wouldExceed"],
  };
}

export async function logSpending(
  userId: string,
  amount: number,
  currencyType: CurrencyType = "VXP",
): Promise<boolean> {
  const { data, error } = await supabase.rpc("log_spending", {
    p_user_id: userId,
    p_amount: amount,
    p_currency_type: currencyType,
  });

  if (error) {
    console.error("[ECONOMY REPO] log_spending error", error.message);
    return false;
  }

  const result = data as { success: boolean };
  return result.success;
}

export async function snapshotBalance(
  userId: string,
  currencyType: CurrencyType = "VXP",
): Promise<boolean> {
  const { data, error } = await supabase.rpc("snapshot_balance", {
    p_user_id: userId,
    p_currency_type: currencyType,
  });

  if (error) {
    console.error("[ECONOMY REPO] snapshot_balance error", error.message);
    return false;
  }

  const result = data as { success: boolean };
  return result.success;
}

export async function getXpRule(slug: string): Promise<XpRule | null> {
  const { data, error } = await supabase
    .from("xp_rules")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[ECONOMY REPO] getXpRule error", error.message);
    return null;
  }

  return data as XpRule | null;
}

export async function getAllXpRules(): Promise<XpRule[]> {
  const { data, error } = await supabase
    .from("xp_rules")
    .select("*")
    .order("priority", { ascending: false });

  if (error) {
    console.error("[ECONOMY REPO] getAllXpRules error", error.message);
    return [];
  }

  return (data as XpRule[]) ?? [];
}

export async function updateXpRule(
  slug: string,
  updates: Partial<Pick<XpRule, "base_xp" | "enabled" | "daily_limit" | "weekly_limit" | "monthly_limit" | "minimum_level" | "maximum_level" | "cooldown_minutes" | "title">>,
): Promise<boolean> {
  const { error } = await supabase.rpc("admin_update_xp_rule", {
    p_slug: slug,
    p_updates: updates,
  });

  if (error) {
    console.error("[ECONOMY REPO] updateXpRule error", error.message);
    return false;
  }

  return true;
}

export async function getActiveMultipliers(): Promise<XpMultiplier[]> {
  const { data, error } = await supabase
    .from("xp_multipliers")
    .select("*")
    .eq("enabled", true)
    .order("priority", { ascending: true });

  if (error) {
    console.error("[ECONOMY REPO] getActiveMultipliers error", error.message);
    return [];
  }

  return (data as XpMultiplier[]) ?? [];
}

export async function getAllMultipliers(): Promise<XpMultiplier[]> {
  const { data, error } = await supabase
    .from("xp_multipliers")
    .select("*")
    .order("priority", { ascending: true });

  if (error) {
    console.error("[ECONOMY REPO] getAllMultipliers error", error.message);
    return [];
  }

  return (data as XpMultiplier[]) ?? [];
}

export async function updateMultiplier(
  slug: string,
  updates: Partial<Pick<XpMultiplier, "multiplier" | "enabled" | "start_date" | "end_date" | "title">>,
): Promise<boolean> {
  const { error } = await supabase.rpc("admin_update_multiplier", {
    p_slug: slug,
    p_updates: updates,
  });

  if (error) {
    console.error("[ECONOMY REPO] updateMultiplier error", error.message);
    return false;
  }

  return true;
}

export async function getDailyEarnings(userId: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .rpc("get_daily_earnings", { p_user_id: userId, p_date: today });

  if (error) {
    console.error("[ECONOMY REPO] get_daily_earnings error", error.message);
    return 0;
  }
  return (data as { total: number } | null)?.total ?? 0;
}

export async function getUserBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("profiles")
    .select("current_vxp")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[ECONOMY REPO] getUserBalance error", error.message);
    return 0;
  }
  return (data as { current_vxp: number } | null)?.current_vxp ?? 0;
}

export async function getEconomySetting(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("economy_settings")
    .select("setting_value")
    .eq("setting_key", key)
    .maybeSingle();

  if (error) {
    console.error("[ECONOMY REPO] getEconomySetting error", error.message);
    return null;
  }

  return (data as { setting_value: string } | null)?.setting_value ?? null;
}
