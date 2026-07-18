import {
  creditWallet,
  debitWallet,
  getWalletBalance,
  getWalletHistory,
} from "../repositories/walletRepository";
import type {
  WalletTransactionType,
  WalletLedgerEntry,
  WalletBalance,
  WalletResult,
} from "../types";

export interface CreditInput {
  userId: string;
  amount: number;
  transactionType: WalletTransactionType;
  referenceType?: string;
  referenceId?: string;
  description?: string;
}

export interface DebitInput {
  userId: string;
  amount: number;
  transactionType: WalletTransactionType;
  referenceType?: string;
  referenceId?: string;
  description?: string;
}

export async function credit(input: CreditInput): Promise<WalletResult> {
  if (!input.userId) {
    return { success: false, error: "User ID required" };
  }
  if (input.amount <= 0) {
    return { success: false, error: "Amount must be positive" };
  }

  return creditWallet(
    input.userId,
    input.amount,
    input.transactionType,
    input.referenceType,
    input.referenceId,
    input.description,
  );
}

export async function debit(input: DebitInput): Promise<WalletResult> {
  if (!input.userId) {
    return { success: false, error: "User ID required" };
  }
  if (input.amount <= 0) {
    return { success: false, error: "Amount must be positive" };
  }

  return debitWallet(
    input.userId,
    input.amount,
    input.transactionType,
    input.referenceType,
    input.referenceId,
    input.description,
  );
}

export async function balance(userId: string): Promise<WalletBalance | null> {
  if (!userId) return null;
  return getWalletBalance(userId);
}

export async function history(
  userId: string,
  limit = 50,
  offset = 0,
): Promise<{ data: WalletLedgerEntry[]; total: number }> {
  if (!userId) return { data: [], total: 0 };
  return getWalletHistory(userId, limit, offset);
}
