import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getUserShipping,
  getShippingTimeline,
  getShippingByRedeem,
  updateShippingStatusRpc,
  getShippingQueue,
} from "../repositories/shippingRepository";
import type { ShippingStatus } from "../types";

export function useUserShipping(userId: string | undefined) {
  return useQuery({
    queryKey: ["shipping", "user", userId],
    queryFn: () => getUserShipping(userId!),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useShippingByRedeem(redeemId: string | undefined) {
  return useQuery({
    queryKey: ["shipping", "redeem", redeemId],
    queryFn: () => getShippingByRedeem(redeemId!),
    enabled: !!redeemId,
    staleTime: 15_000,
  });
}

export function useShippingTimeline(shippingId: string | undefined) {
  return useQuery({
    queryKey: ["shipping", shippingId, "timeline"],
    queryFn: () => getShippingTimeline(shippingId!),
    enabled: !!shippingId,
    staleTime: 15_000,
  });
}

export function useShippingQueue(status?: ShippingStatus) {
  return useQuery({
    queryKey: ["shipping", "queue", status ?? "all"],
    queryFn: () => getShippingQueue(status),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useUpdateShippingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      shippingId,
      status,
      note,
      trackingNumber,
    }: {
      shippingId: string;
      status: ShippingStatus;
      note?: string;
      trackingNumber?: string;
    }) =>
      updateShippingStatusRpc(
        shippingId,
        status,
        note,
        undefined,
        trackingNumber,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping"] });
    },
  });
}
