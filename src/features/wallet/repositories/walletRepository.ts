import { supabase } from "@/lib/supabase";
import type {
  WalletLedgerEntry,
  WalletResult,
  CreateTransactionInput,
  AdminTransactionResult,
} from "../types";

export async function getWalletHistory(
  userId: string,
  limit = 50,
  offset = 0,
): Promise<{ data: WalletLedgerEntry[]; total: number }> {
  const countQuery = supabase
    .from("wallet_ledger")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const dataQuery = supabase
    .from("wallet_ledger")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

  if (dataResult.error) {
    return { data: [], total: 0 };
  }

  return {
    data: dataResult.data as WalletLedgerEntry[],
    total: countResult.count ?? 0,
  };
}

// Sprint C.2 — Wallet Ledger v2 RPCs

export async function createTransaction(input: CreateTransactionInput): Promise<WalletResult> {
  const { data, error } = await supabase.rpc("create_transaction", {
    p_user_id: input.userId,
    p_amount: input.amount,
    p_transaction_type: input.transactionType,
    p_transaction_key: input.transactionKey,
    p_source: input.source ?? "",
    p_reference_id: input.referenceId ?? "",
    p_description: input.description ?? "",
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data as WalletResult;
}

export async function commitTransaction(transactionKey: string): Promise<WalletResult> {
  const { data, error } = await supabase.rpc("commit_transaction", {
    p_transaction_key: transactionKey,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data as WalletResult;
}

export async function failTransaction(
  transactionKey: string,
  failReason?: string,
): Promise<WalletResult> {
  const { data, error } = await supabase.rpc("fail_transaction", {
    p_transaction_key: transactionKey,
    p_error: failReason ?? "",
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data as WalletResult;
}

export async function rollbackTransaction(
  transactionKey: string,
  reason?: string,
): Promise<WalletResult> {
  const { data, error } = await supabase.rpc("rollback_transaction", {
    p_transaction_key: transactionKey,
    p_reason: reason ?? "",
    p_rolled_back_by: null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data as WalletResult;
}

export async function retryTransaction(transactionKey: string): Promise<WalletResult> {
  const { data, error } = await supabase.rpc("retry_transaction", {
    p_transaction_key: transactionKey,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data as WalletResult;
}

export async function getTransactionsAdmin(params: {
  limit?: number;
  offset?: number;
  status?: string;
  userId?: string;
  source?: string;
}): Promise<{ data: AdminTransactionResult[]; total: number }> {
  const { data, error } = await supabase.rpc("get_transactions_admin", {
    p_limit: params.limit ?? 50,
    p_offset: params.offset ?? 0,
    p_status: params.status ?? null,
    p_user_id: params.userId ?? null,
    p_source: params.source ?? null,
  });

  if (error) {
    return { data: [], total: 0 };
  }

  const result = data as {
    success: boolean;
    data: AdminTransactionResult[];
    total: number;
  };

  if (!result.success) return { data: [], total: 0 };

  return { data: result.data, total: result.total };
}

export async function checkDuplicateTransaction(transactionKey: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_duplicate", {
    p_transaction_key: transactionKey,
  });

  if (error) return false;
  return (data as { exists: boolean })?.exists ?? false;
}
