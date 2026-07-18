import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/useAuth";
import { processRedeem } from "../services/redeemEngine";
import { getUserRedeems } from "../repositories/redeemRepository";
import type { RedeemInput } from "../types";

export function useRedeem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<RedeemInput, "userId">) => {
      if (!user) throw new Error("User not logged in");

      return processRedeem({ ...input, userId: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      queryClient.invalidateQueries({ queryKey: ["user-redeems"] });
    },
  });
}

export function useUserRedeems() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-redeems", user?.id],
    queryFn: () => getUserRedeems(user!.id),
    enabled: !!user,
    initialData: [],
  });
}
