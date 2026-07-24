import { debit } from "@/features/wallet/services/walletEngine";

export interface DeductVXPInput {
  userId: string;
  amount: number;
  reason: string;
  reference_id?: string;
}

export async function deductVXP({
  userId,
  amount,
  reason,
  reference_id,
}: DeductVXPInput) {
  return debit({
    userId,
    amount: Math.abs(amount),
    transactionType: "REDEEM",
    transactionKey: reference_id ? `REDEEM_${userId}_${reference_id}` : undefined,
    referenceType: "reward",
    referenceId: reference_id,
    description: reason,
  });
}
