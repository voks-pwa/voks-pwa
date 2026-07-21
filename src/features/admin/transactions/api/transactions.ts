import { supabase } from "@/lib/supabase";
import type { AdminTransaction, AdminTransactionsResponse, TransactionFilters } from "../types";

export async function getTransactions(
  filters: TransactionFilters = {},
): Promise<AdminTransactionsResponse> {
  const { data, error } = await supabase.rpc("get_transactions_admin", {
    p_limit: filters.pageSize ?? 50,
    p_offset: ((filters.page ?? 1) - 1) * (filters.pageSize ?? 50),
    p_status: filters.status ?? null,
    p_user_id: filters.userId ?? null,
    p_source: filters.source ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  const result = data as {
    success: boolean;
    data: AdminTransaction[];
    total: number;
  };

  if (!result.success) {
    throw new Error("Failed to fetch transactions");
  }

  return { data: result.data, total: result.total };
}

export async function rollbackTransaction(
  transactionKey: string,
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("rollback_transaction", {
    p_transaction_key: transactionKey,
    p_reason: reason ?? "Admin rollback",
    p_rolled_back_by: null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data as { success: boolean; error?: string };
}

export async function retryTransaction(
  transactionKey: string,
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("retry_transaction", {
    p_transaction_key: transactionKey,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data as { success: boolean; error?: string };
}
