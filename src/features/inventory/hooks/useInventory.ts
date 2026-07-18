import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getInventory,
  getAllInventory,
  getLowStockByWarning,
  getLedgerHistory,
  reserveStockRpc,
  deductStockRpc,
  adjustStockRpc,
} from "../repositories/inventoryRepository";

export function useInventory(rewardId: number | undefined) {
  return useQuery({
    queryKey: ["inventory", rewardId],
    queryFn: () => getInventory(rewardId!),
    enabled: !!rewardId,
    staleTime: 15_000,
  });
}

export function useAllInventory() {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: getAllInventory,
    staleTime: 30_000,
  });
}

export function useLowStockItems() {
  return useQuery({
    queryKey: ["inventory", "low-stock"],
    queryFn: getLowStockByWarning,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useInventoryLedger(rewardId: number | undefined, limit = 50) {
  return useQuery({
    queryKey: ["inventory", rewardId, "ledger"],
    queryFn: () => getLedgerHistory(rewardId!, limit),
    enabled: !!rewardId,
    staleTime: 15_000,
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rewardId,
      newStock,
      adminId,
      reason,
    }: {
      rewardId: number;
      newStock: number;
      adminId?: string;
      reason?: string;
    }) => adjustStockRpc(rewardId, newStock, adminId, reason ?? ""),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({
        queryKey: ["inventory", variables.rewardId],
      });
    },
  });
}

export function useReserveStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rewardId,
      quantity,
    }: {
      rewardId: number;
      quantity?: number;
    }) => reserveStockRpc(rewardId, quantity ?? 1),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["inventory", variables.rewardId],
      });
    },
  });
}

export function useDeductStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rewardId,
      quantity,
      referenceType,
      referenceId,
    }: {
      rewardId: number;
      quantity?: number;
      referenceType?: string;
      referenceId?: string;
    }) =>
      deductStockRpc(
        rewardId,
        quantity ?? 1,
        referenceType ?? "",
        referenceId ?? "",
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}
