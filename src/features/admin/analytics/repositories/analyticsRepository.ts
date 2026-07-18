import { supabase } from "@/lib/supabase";

import type { AnalyticsResponse } from "../types/analytics";

export async function getAnalytics(days: number = 30): Promise<AnalyticsResponse> {
  const { data, error } = await supabase.functions.invoke(
    "admin-analytics",
    { body: { days } }
  );

  if (error) throw error;

  if (!data.success) {
    throw new Error(data.error ?? "Failed to load analytics");
  }

  return data.data as AnalyticsResponse;
}
