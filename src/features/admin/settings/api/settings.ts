import { supabase } from "@/lib/supabase";

import type { SettingsResponse, AdminProfile, PlatformSettings } from "../types/settings";

export async function getSettings(): Promise<SettingsResponse> {
  const { data, error } = await supabase.functions.invoke(
    "admin-settings",
    { body: { action: "get" } }
  );

  if (error) throw error;
  if (!data.success) throw new Error(data.error ?? "Failed to load settings");

  return { profile: data.profile, settings: data.settings };
}

export async function updateProfile(updates: Partial<Pick<AdminProfile, "display_name" | "avatar_url">>): Promise<AdminProfile> {
  const { data, error } = await supabase.functions.invoke(
    "admin-settings",
    { body: { action: "update_profile", ...updates } }
  );

  if (error) throw error;
  if (!data.success) throw new Error(data.error ?? "Failed to update profile");

  return data.profile;
}

export async function updateSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
  const { data, error } = await supabase.functions.invoke(
    "admin-settings",
    { body: { action: "update_settings", settings } }
  );

  if (error) throw error;
  if (!data.success) throw new Error(data.error ?? "Failed to update settings");

  return data.settings;
}
