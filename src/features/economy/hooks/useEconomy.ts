import { useQuery } from "@tanstack/react-query";
import { loadEconomyConfig, validateTransaction, calculateXP } from "../services/economyEngine";
import { getAllXpRules, getActiveMultipliers, getAllMultipliers } from "../repositories/economyRepository";
import type { ValidateTransactionInput } from "../services/economyEngine";
import type { XpSource } from "../types";

export function useEconomyConfig() {
  return useQuery({
    queryKey: ["economy-config"],
    queryFn: loadEconomyConfig,
    staleTime: 300_000,
    retry: 2,
  });
}

export function useTransactionValidation(input: ValidateTransactionInput | null) {
  return useQuery({
    queryKey: ["economy-validate", input?.userId, input?.amount, input?.currencyType],
    queryFn: () => (input ? validateTransaction(input) : null),
    enabled: !!input,
    staleTime: 30_000,
    retry: false,
  });
}

export function useXpRules() {
  return useQuery({
    queryKey: ["xp-rules"],
    queryFn: getAllXpRules,
    staleTime: 300_000,
  });
}

export function useActiveMultipliers() {
  return useQuery({
    queryKey: ["xp-multipliers", "active"],
    queryFn: getActiveMultipliers,
    staleTime: 300_000,
  });
}

export function useAllMultipliers() {
  return useQuery({
    queryKey: ["xp-multipliers", "all"],
    queryFn: getAllMultipliers,
    staleTime: 300_000,
  });
}

export function useCalculateXP(source: XpSource | null, userId: string | undefined, context?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["xp-calculate", source, userId],
    queryFn: () => {
      if (!source || !userId) return null;
      return calculateXP({ source, userId, context });
    },
    enabled: !!source && !!userId,
    staleTime: 30_000,
    retry: false,
  });
}
