import { xpTransaction } from "./xpTransaction";

interface BonusXPInput {
  userId: string;
  amount: number;
  reason: string;
  referenceId?: string;
}

export async function giveBonusXP({
  userId,
  amount,
  reason,
  referenceId,
}: BonusXPInput) {
  return xpTransaction({
    userId,
    amount,
    transaction_type: "bonus",
    reason,
    reference_id: referenceId,
  });
}