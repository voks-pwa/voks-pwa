import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/useAuth";
import { processRedeem, type RedeemEngineDependencies } from "../engine/redeemEngine";
import { getUserRedeems } from "../repositories/redeemRepository";
import type { RedeemInput } from "../types";
import { recordEvent } from "@/features/commerce/services/commerceEngine";
import { requestVoucher, assignVoucher } from "@/features/voucher/engine/voucherPoolEngine";
import { createFulfillment } from "@/features/shipping/services/fulfillmentEngine";

export function useRedeem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<RedeemInput, "userId">) => {
      if (!user) throw new Error("User not logged in");

      const deps: RedeemEngineDependencies = { recordEvent, requestVoucher, assignVoucher, createFulfillment };
      return processRedeem({ ...input, userId: user.id }, deps);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
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
