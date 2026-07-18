import { supabase } from "@/lib/supabase";
import type { WalletLedgerEntry, WalletBalance, WalletResult } from "../types";

export async function creditWallet(
  userId: string,
  amount: number,
  transactionType: string,
  referenceType?: string,
  referenceId?: string,
  description?: string,
): Promise<WalletResult> {
  const { data, error } = await supabase.rpc("credit_wallet", {
    p_user_id: userId,
    p_amount: amount,
    p_transaction_type: transactionType,
    p_reference_type: referenceType ?? "",
    p_reference_id: referenceId ?? "",
    p_description: description ?? "",
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const result = data as WalletResult;
  return result;
}

export async function debitWallet(
  userId: string,
  amount: number,
  transactionType: string,
  referenceType?: string,
  referenceId?: string,
  description?: string,
): Promise<WalletResult> {
  const { data, error } = await supabase.rpc("debit_wallet", {
    p_user_id: userId,
    p_amount: amount,
    p_transaction_type: transactionType,
    p_reference_type: referenceType ?? "",
    p_reference_id: referenceId ?? "",
    p_description: description ?? "",
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const result = data as WalletResult;
  return result;
}

export async function getWalletBalance(userId: string): Promise<WalletBalance | null> {
  const { data, error } = await supabase.rpc("get_wallet_balance", {
    p_user_id: userId,
  });

  if (error) {
    return null;
  }

  const result = data as { success: boolean; balance: number; lifetime_vxp: number };
  if (!result.success) return null;

  return { balance: result.balance, lifetime_vxp: result.lifetime_vxp };
}

export interface WalletHistoryResult {
  data: WalletLedgerEntry[];
  total: number;
}

export async function getWalletHistory(
  userId: string,
  limit = 50,
  offset = 0,
): Promise<WalletHistoryResult> {
  const { data, error } = await supabase.rpc("get_wallet_history", {
    p_user_id: userId,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) {
    return { data: [], total: 0 };
  }

  const result = data as {
    success: boolean;
    data: WalletLedgerEntry[];
    total: number;
  };

  if (!result.success) return { data: [], total: 0 };

  return { data: result.data, total: result.total };
}
