import { supabase } from "@/lib/supabase";

export async function updateRewardRedemption(
  redemptionId: string,
  status: string,
  notes?: string
) {
  const { data, error } =
    await supabase.functions.invoke(
      "admin-update-redemption",
      {
        body: {
          redemptionId,
          status,
          notes,
        },
      }
    );

  if (error) throw error;

  return data.redemption;
}