import { supabase } from "@/lib/supabase";

export interface UserRedemption {
  id: string;
  reward_wp_id: string | null;
  reward_slug: string;
  reward_name: string;
  reward_cost: number;
  reward_status:
    | "pending"
    | "approved"
    | "completed"
    | "rejected";
  redeemed_at: string;
  approved_at: string | null;
  completed_at: string | null;
  notes: string | null;
}

export async function getUserRedemptions(
  userId: string
): Promise<UserRedemption[]> {
  const { data, error } = await supabase
    .from("reward_redemptions")
    .select(
      `
      id,
      reward_wp_id,
      reward_slug,
      reward_name,
      reward_cost,
      reward_status,
      redeemed_at,
      approved_at,
      completed_at,
      notes
    `
    )
    .eq("user_id", userId)
    .order("redeemed_at", {
      ascending: false,
    });

  if (error) throw error;

  return data ?? [];
}
