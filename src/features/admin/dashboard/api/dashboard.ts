import { supabase } from "@/lib/supabase";
import type { DashboardResponse } from "../types/dashboard";

export async function getDashboard(): Promise<DashboardResponse> {
  const { data, error } =
    await supabase.functions.invoke("admin-dashboard");

  console.log("Dashboard Response", data);
  console.log("Dashboard Error", error);

  if (error) throw error;

  return data;
}