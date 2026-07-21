import { supabase } from "@/lib/supabase";
import type { SystemHealth, FeatureFlag, MaintenanceConfig, AppVersion, AuditLogEntry } from "../types";

export async function getSystemHealth(): Promise<SystemHealth> {
  const { data, error } = await supabase.functions.invoke("system-health");
  if (error) throw error;
  if (!data.success) throw new Error(data.error ?? "system-health failed");
  return data as SystemHealth;
}

export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  const { data, error } = await supabase.functions.invoke("admin-feature-flags", {
    body: { action: "list" },
  });
  if (error) throw error;
  if (!data.success) throw new Error(data.error ?? "getFeatureFlags failed");
  return data.data as FeatureFlag[];
}

export async function updateFeatureFlag(key: string, enabled: boolean): Promise<FeatureFlag> {
  const { data, error } = await supabase.functions.invoke("admin-feature-flags", {
    body: { action: "update", key, enabled },
  });
  if (error) throw error;
  if (!data.success) throw new Error(data.error ?? "updateFeatureFlag failed");
  return data.data as FeatureFlag;
}

export async function getMaintenanceConfig(): Promise<MaintenanceConfig> {
  const { data, error } = await supabase
    .from("system_config")
    .select("value")
    .eq("key", "maintenance_mode")
    .single();
  if (error) throw error;
  return (data?.value as MaintenanceConfig) ?? { enabled: false, message: "" };
}

export async function updateMaintenanceConfig(config: MaintenanceConfig): Promise<void> {
  const { error } = await supabase
    .from("system_config")
    .update({ value: config as unknown as Record<string, unknown>, updated_at: new Date().toISOString() })
    .eq("key", "maintenance_mode");
  if (error) throw error;
}

export async function getAppVersion(): Promise<AppVersion> {
  const { data, error } = await supabase
    .from("system_config")
    .select("value")
    .eq("key", "app_version")
    .single();
  if (error) throw error;
  return (data?.value as AppVersion) ?? { version: "0.0.0", build_number: "0", build_date: null };
}

export async function getAuditLogs(limit: number = 50): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from("admin_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as AuditLogEntry[];
}
