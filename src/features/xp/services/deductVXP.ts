import { xpTransaction } from "./xpTransaction";

export async function deductVXP(
  userId: string,
  amount: number,
  reason: string,
  reference_id?: string,
) {
  return xpTransaction({
    userId,
    amount: -Math.abs(amount),
    reason,
    reference_id,
    transaction_type: "reward",
  });
}