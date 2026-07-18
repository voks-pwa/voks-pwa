import { useQuery } from "@tanstack/react-query";

import { rewardService } from "../services/rewardService";
import type { RewardRedemption } from "../types";

export function useRewardRedemptions() {
  return useQuery<RewardRedemption[]>({
    queryKey: ["admin-rewards"],
    queryFn: rewardService.getRewardRedemptions,
    initialData: [],
  });
}