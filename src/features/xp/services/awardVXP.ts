import { xpTransaction } from "./xpTransaction";

export async function awardVXP(
  userId: string,
  amount: number,
  reason: string,
  reference_id?: string,
) {
  return xpTransaction({
    userId,
    amount,
    reason,
    reference_id,
    transaction_type: "mission",
  });
}