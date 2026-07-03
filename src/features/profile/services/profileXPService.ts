import { xpTransaction } from "@/features/xp/services/xpTransaction";

export async function awardVXP(
  userId: string,
  amount: number,
  reason = "Bonus",
) {
  return xpTransaction({
    userId,
    amount,
    transaction_type: "mission",
    reason,
    reference_id: userId,
  });
}

export async function deductVXP(
  userId: string,
  amount: number,
  reason = "Deduction",
  referenceId?: string,
) {
  return xpTransaction({
    userId,
    amount: -Math.abs(amount),
    transaction_type: "reward",
    reason,
    reference_id: referenceId,
  });
}