import { xpTransaction } from "./xpTransaction";

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
  return xpTransaction({
    userId,
    amount: -Math.abs(amount),
    reason,
    reference_id,
    transaction_type: "reward",
  });
}