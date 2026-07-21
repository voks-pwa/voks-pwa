import {
  createTransaction,
  commitTransaction,
  failTransaction,
  getWalletHistory,
} from "../repositories/walletRepository";
import { getCanonicalUser } from "@/features/profile/services/userCanonicalService";
import {
  validateTransaction,
  recordSpending,
} from "@/features/economy/services/economyEngine";
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
  transactionKey?: string;
  referenceType?: string;
  referenceId?: string;
  description?: string;
}

export interface DebitInput {
  userId: string;
  amount: number;
  transactionType: WalletTransactionType;
  transactionKey?: string;
  referenceType?: string;
  referenceId?: string;
  description?: string;
}

function generateTransactionKey(
  type: string,
  userId: string,
  referenceId?: string,
): string {
  const ts = Date.now();
  const ref = referenceId ? `${referenceId}_` : "";
  return `${type}_${userId}_${ref}${ts}`;
}

export async function credit(input: CreditInput): Promise<WalletResult> {
  if (!input.userId) {
    return { success: false, error: "User ID required" };
  }
  if (input.amount <= 0) {
    return { success: false, error: "Amount must be positive" };
  }

  const validation = await validateTransaction({
    userId: input.userId,
    amount: input.amount,
  });

  if (!validation.allowed) {
    return { success: false, error: validation.error ?? "Transaction rejected by economy rules" };
  }

  const txnKey = input.transactionKey ?? generateTransactionKey(
    input.transactionType,
    input.userId,
    input.referenceId,
  );

  const created = await createTransaction({
    userId: input.userId,
    amount: input.amount,
    transactionType: input.transactionType,
    transactionKey: txnKey,
    source: input.referenceType,
    referenceId: input.referenceId,
    description: input.description,
  });

  if (!created.success) {
    return created;
  }

  const committed = await commitTransaction(txnKey);

  if (!committed.success) {
    await failTransaction(txnKey, committed.error ?? "Commit failed");
    return committed;
  }

  return committed;
}

export async function debit(input: DebitInput): Promise<WalletResult> {
  if (!input.userId) {
    return { success: false, error: "User ID required" };
  }
  if (input.amount <= 0) {
    return { success: false, error: "Amount must be positive" };
  }

  const validation = await validateTransaction({
    userId: input.userId,
    amount: -input.amount,
  });

  if (!validation.allowed) {
    return { success: false, error: validation.error ?? "Transaction rejected by economy rules" };
  }

  const txnKey = input.transactionKey ?? generateTransactionKey(
    input.transactionType,
    input.userId,
    input.referenceId,
  );

  const created = await createTransaction({
    userId: input.userId,
    amount: -input.amount,
    transactionType: input.transactionType,
    transactionKey: txnKey,
    source: input.referenceType,
    referenceId: input.referenceId,
    description: input.description,
  });

  if (!created.success) {
    return created;
  }

  const committed = await commitTransaction(txnKey);

  if (!committed.success) {
    await failTransaction(txnKey, committed.error ?? "Commit failed");
    return committed;
  }

  if (committed.success) {
    await recordSpending(input.userId, input.amount);
  }

  return committed;
}

export async function balance(userId: string): Promise<WalletBalance | null> {
  if (!userId) return null;
  const canonical = await getCanonicalUser(userId);
  return {
    balance: canonical.wallet.balance,
    lifetime_vxp: canonical.wallet.lifetime_vxp,
  };
}

export async function history(
  userId: string,
  limit = 50,
  offset = 0,
): Promise<{ data: WalletLedgerEntry[]; total: number }> {
  if (!userId) return { data: [], total: 0 };
  return getWalletHistory(userId, limit, offset);
}

export { generateTransactionKey };
