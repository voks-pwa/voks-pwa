import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

import type {
  RewardRedemption,
} from "../adminTypes";

export function useRewardRedemptions() {
  return useQuery<RewardRedemption[]>({
    queryKey: ["reward-redemptions"],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_redemptions")
        .select("*")
        .order("redeemed_at", {
          ascending: false,
        });

      if (error) throw error;

      return data as RewardRedemption[];
    },
  });
}