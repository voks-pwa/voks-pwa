import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllRewardCatalog,
  getActiveRewardCatalog,
  getRewardCatalogBySlug,
  getRewardCatalogById,
} from "../repositories/rewardSyncRepository";
import { syncAll } from "../services/rewardSyncEngine";
import { rewardKeys } from "../queries/rewardQueries";

export function useRewardCatalog() {
  return useQuery({
    queryKey: rewardKeys.all,
    queryFn: getAllRewardCatalog,
    staleTime: 120_000,
  });
}

export function useActiveRewards() {
  return useQuery({
    queryKey: rewardKeys.active,
    queryFn: getActiveRewardCatalog,
    staleTime: 60_000,
  });
}

export function useRewardBySlug(slug: string) {
  return useQuery({
    queryKey: rewardKeys.bySlug(slug),
    queryFn: () => getRewardCatalogBySlug(slug),
    enabled: !!slug,
    staleTime: 60_000,
  });
}

export function useRewardById(id: number) {
  return useQuery({
    queryKey: rewardKeys.byId(id),
    queryFn: () => getRewardCatalogById(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useSyncRewards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.active });
    },
  });
}
