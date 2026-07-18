import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/useAuth";

import { getUserRedemptions } from "../repositories/rewardRedemptionRepository";

export function useUserRedemptions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [
      "user-redemptions",
      user?.id,
    ],
    queryFn: () =>
      getUserRedemptions(
        user!.id
      ),
    enabled: !!user,
    initialData: [],
  });
}
