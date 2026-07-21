import { supabase } from "@/lib/supabase";
import type { PaymentRecord, PaymentResult } from "../types";

export async function createPaymentRecord(
  orderId: string,
  userId: string,
  amount: number,
  paymentMethod: string,
  currency: string = "VXP",
  idempotencyKey?: string,
): Promise<PaymentResult> {
  const { data, error } = await supabase.rpc("create_payment", {
    p_order_id: orderId,
    p_user_id: userId,
    p_amount: amount,
    p_payment_method: paymentMethod,
    p_currency: currency,
    p_idempotency_key: idempotencyKey ?? "",
  });

  if (error) return { success: false, error: error.message };
  return data as PaymentResult;
}

export async function updatePaymentStatus(
  paymentId: string,
  status: string,
  gatewayTxnId?: string,
  metadata?: Record<string, unknown>,
): Promise<PaymentResult> {
  const { data, error } = await supabase.rpc("update_payment_status", {
    p_payment_id: paymentId,
    p_status: status,
    p_gateway_txn_id: gatewayTxnId ?? "",
    p_metadata: metadata ?? {},
  });

  if (error) return { success: false, error: error.message };
  return data as PaymentResult;
}

export async function getPaymentByOrderId(orderId: string): Promise<PaymentRecord | null> {
  const { data, error } = await supabase
    .from("payment_records")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getPaymentById(id: string): Promise<PaymentRecord | null> {
  const { data, error } = await supabase
    .from("payment_records")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getPaymentsByUser(userId: string): Promise<PaymentRecord[]> {
  const { data, error } = await supabase
    .from("payment_records")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getAllPayments(): Promise<PaymentRecord[]> {
  const { data, error } = await supabase
    .from("payment_records")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
