import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTransactions, rollbackTransaction, retryTransaction } from "../api/transactions";
import type { TransactionFilters } from "../types";
import { useState } from "react";

export function useTransactions() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<TransactionFilters>({
    status: undefined,
    userId: undefined,
    source: undefined,
    page: 1,
    pageSize: 50,
  });

  const query = useQuery({
    queryKey: ["admin-transactions", filters],
    queryFn: () => getTransactions(filters),
  });

  const rollback = useMutation({
    mutationFn: ({ transactionKey, reason }: { transactionKey: string; reason?: string }) =>
      rollbackTransaction(transactionKey, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
    },
  });

  const retry = useMutation({
    mutationFn: ({ transactionKey }: { transactionKey: string }) =>
      retryTransaction(transactionKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
    },
  });

  return {
    query,
    filters,
    setFilters,
    rollback,
    retry,
  };
}
