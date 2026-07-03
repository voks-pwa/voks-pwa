import { xpTransaction } from "./xpTransaction";

interface AdminPayload {
  userId: string;
  amount: number;
  reason: string;
  reference_id?: string;
}

export async function adminAdjustXP({
  userId,
  amount,
  reason,
  reference_id,
}: AdminPayload) {
  return xpTransaction({
    userId,
    amount,
    reason,
    reference_id,
    transaction_type: "admin",
  });
}