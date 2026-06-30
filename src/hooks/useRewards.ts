import { useQuery } from "@tanstack/react-query";

import { getRewards } from "@/services/wordpress-api";

import { mapReward } from "@/features/rewards/rewardMapper";

import type {
  Reward,
} from "@/features/rewards/rewardTypes";

export function useRewards() {
  return useQuery<Reward[]>({
    queryKey: ["rewards"],

    queryFn: async () => {
      const data =
        await getRewards();

      return data
        .map(mapReward)
        .sort(
          (a: Reward, b: Reward) =>
            a.priority - b.priority
        );
        
      },
  });
}