import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRewardAggregate } from "@/features/rewards/repositories/rewardAggregateRepository";
import { syncAll, toggleRewardActive, updateRewardCost, updateRewardFeatured, updateRewardPriority } from "@/features/rewards/services/rewardSyncEngine";
import { adjustStock } from "@/features/inventory/services/inventoryEngine";
import { rewardKeys } from "@/features/rewards/queries/rewardQueries";

export const adminRewardKeys = {
  all: ["admin-reward-aggregate"] as const,
};

export function useAdminRewardCatalog() {
  return useQuery({
    queryKey: adminRewardKeys.all,
    queryFn: getRewardAggregate,
  });
}

export function useAdjustRewardStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rewardId,
      newStock,
      adminId,
      reason,
    }: {
      rewardId: number;
      newStock: number;
      adminId?: string;
      reason?: string;
    }) => adjustStock(rewardId, newStock, adminId, reason ?? ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminRewardKeys.all });
    },
  });
}

export function useSyncRewardsFromWP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.active });
    },
  });
}

export function useToggleRewardActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      toggleRewardActive(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
    },
  });
}

export function useUpdateRewardCost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, cost }: { id: number; cost: number }) =>
      updateRewardCost(id, cost),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
    },
  });
}

export function useUpdateRewardFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, featured }: { id: number; featured: boolean }) =>
      updateRewardFeatured(id, featured),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
    },
  });
}

export function useUpdateRewardPriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, priority }: { id: number; priority: number }) =>
      updateRewardPriority(id, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
    },
  });
}
