import { supabase } from "@/lib/supabase";

import type { WPReward } from "@/features/rewards/rewardTypes";

const WP_API_URL =
  "https://voksradio.com/wp-json/wp/v2";

export interface UpdateRewardPayload {
  rewardId: number;
  name: string;
  subtitle: string;
  description: string;
  cost: number;
  stock: number;
  active: boolean;
  featured: boolean;
  status: string;
}

export async function getAdminRewards(): Promise<
  WPReward[]
> {
  const response = await fetch(
    `${WP_API_URL}/reward?per_page=100`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch rewards"
    );
  }

  return response.json();
}

export async function updateReward(
  payload: UpdateRewardPayload
) {
  const { data, error } =
    await supabase.functions.invoke(
      "admin-reward-update",
      {
        body: payload,
      }
    );

  if (error) throw error;

  if (!data.success) {
    throw new Error(
      data.error?.message ??
        "Failed to update reward"
    );
  }

  return data.reward;
}
