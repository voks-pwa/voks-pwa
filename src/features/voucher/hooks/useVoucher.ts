import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getAllVouchers,
  getUserVouchers,
  getVouchersByStatus,
} from "../repositories/voucherRepository";
import { reserveVoucherRpc, assignVoucherRpc, markVoucherUsedRpc, refundVoucherRpc } from "../repositories/voucherRepository";

export function useVoucherPool(rewardId?: number) {
  return useQuery({
    queryKey: ["voucher-pool", rewardId],
    queryFn: () => getAllVouchers(rewardId),
    staleTime: 30_000,
  });
}

export function useUserVouchers(userId: string | undefined) {
  return useQuery({
    queryKey: ["voucher-pool", "user", userId],
    queryFn: () => getUserVouchers(userId!),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useAvailableVouchers() {
  return useQuery({
    queryKey: ["voucher-pool", "available"],
    queryFn: () => getVouchersByStatus("AVAILABLE"),
    staleTime: 15_000,
  });
}

export function useRequestVoucher() {
  return useMutation({
    mutationFn: async (rewardId: number) => reserveVoucherRpc(rewardId),
  });
}

export function useAssignVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      voucherId,
      userId,
    }: {
      voucherId: string;
      userId: string;
    }) => assignVoucherRpc(voucherId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voucher-pool"] });
    },
  });
}

export function useUseVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (voucherId: string) => markVoucherUsedRpc(voucherId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voucher-pool"] });
    },
  });
}

export function useRefundVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (voucherId: string) => refundVoucherRpc(voucherId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voucher-pool"] });
    },
  });
}
