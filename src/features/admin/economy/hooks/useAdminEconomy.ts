import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminEconomyConfig,
  updateEconomyConfig,
  getAdminXpRules,
  updateAdminXpRule,
  getAdminMultipliers,
  updateAdminMultiplier,
} from "../api/economy";

export function useAdminEconomy() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-economy-config"],
    queryFn: getAdminEconomyConfig,
    staleTime: 120_000,
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: updateEconomyConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-economy-config"] });
    },
  });

  const rulesQuery = useQuery({
    queryKey: ["admin-xp-rules"],
    queryFn: getAdminXpRules,
    staleTime: 120_000,
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({ slug, updates }: { slug: string; updates: Parameters<typeof updateAdminXpRule>[1] }) =>
      updateAdminXpRule(slug, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-xp-rules"] });
    },
  });

  const multipliersQuery = useQuery({
    queryKey: ["admin-xp-multipliers"],
    queryFn: getAdminMultipliers,
    staleTime: 120_000,
  });

  const updateMultiplierMutation = useMutation({
    mutationFn: ({ slug, updates }: { slug: string; updates: Parameters<typeof updateAdminMultiplier>[1] }) =>
      updateAdminMultiplier(slug, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-xp-multipliers"] });
    },
  });

  return {
    config: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateConfig: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    rules: rulesQuery.data ?? [],
    isLoadingRules: rulesQuery.isLoading,
    updateRule: updateRuleMutation.mutateAsync,
    isUpdatingRule: updateRuleMutation.isPending,

    multipliers: multipliersQuery.data ?? [],
    isLoadingMultipliers: multipliersQuery.isLoading,
    updateMultiplier: updateMultiplierMutation.mutateAsync,
    isUpdatingMultiplier: updateMultiplierMutation.isPending,
  };
}
