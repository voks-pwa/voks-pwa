import { useQuery } from "@tanstack/react-query";
import type { WalletLedgerEntry } from "../types";
import { balance, history } from "../services/walletEngine";

export function useWalletBalance(userId: string | null) {
  return useQuery({
    queryKey: ["wallet-balance", userId],
    queryFn: async () => {
      if (!userId) return null;
      return balance(userId);
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useWalletHistory(userId: string | null, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["wallet-history", userId, limit, offset],
    queryFn: async () => {
      if (!userId) return { data: [] as WalletLedgerEntry[], total: 0 };
      return history(userId, limit, offset);
    },
    enabled: !!userId,
    staleTime: 10_000,
  });
}
