import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/useAuth";

import { validateRewardEligibility } from "../services/walletValidationService";

import type { RewardAggregate } from "../types/rewardAggregate";
import type { EligibilityResult } from "../services/walletValidationService";

export function useRewardEligibility(reward: RewardAggregate | null) {
  const { user } = useAuth();

  return useQuery<EligibilityResult>({
    queryKey: [
      "reward-eligibility",
      user?.id,
      reward?.id,
    ],
    queryFn: async () => {
      if (!user || !reward) {
        return { eligible: false, reason: "Authentication required" };
      }

      return validateRewardEligibility(user.id, reward);
    },
    enabled: !!user && !!reward,
    staleTime: 30_000,
  });
}
