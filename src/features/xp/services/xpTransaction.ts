import { supabase } from "@/lib/supabase";

export interface XPTransactionPayload {
  amount: number;
  transaction_type:
    | "bonus"
    | "mission"
    | "reward"
    | "admin"
    | "referral"
    | "manual";
  reason: string;
  reference_id?: string;
  userId: string;
}

export async function xpTransaction(
  payload: XPTransactionPayload
) {
  const { data, error } =
    await supabase.functions.invoke(
      "xp-transaction",
      {
        body: payload,
      }
    );

  if (error) {
    throw error;
  }

  return data;
}