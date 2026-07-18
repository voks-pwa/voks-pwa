import { xpTransaction } from "./xpTransaction";

export interface AwardVXPInput {
  userId: string;
  amount: number;
  reason: string;
  reference_id?: string;
}

export async function awardVXP({
  userId,
  amount,
  reason,
  reference_id,
}: AwardVXPInput) {
  return xpTransaction({
    userId,
    amount,
    transaction_type: "mission",
    reason,
    reference_id,
  });
}