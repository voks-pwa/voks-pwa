import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { RewardItem } from "@/features/rewards/rewardTypes";
import { redeemReward } from "@/services/reward-service";
import { useAuth } from "@/features/auth/useAuth";

export function useRedeemReward() {

  const { user } = useAuth();

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: async (reward: RewardItem) => {

      if (!user) {

        throw new Error("User not logged in");

      }

      return redeemReward(
        user.id,
        reward
      );

    },

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });

      queryClient.invalidateQueries({
        queryKey: ["rewards"],
      });

      queryClient.invalidateQueries({
        queryKey: ["user-redemptions"],
      });

    },

  });

}