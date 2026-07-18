import { supabase } from "@/lib/supabase";

export async function getRewardRedemptions() {
  const { data, error } =
    await supabase.functions.invoke(
      "admin-rewards"
    );

  if (error) throw error;

  return data.redemptions ?? [];
}