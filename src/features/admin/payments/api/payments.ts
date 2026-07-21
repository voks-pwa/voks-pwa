import { supabase } from "@/lib/supabase";
import type { PaymentRecord } from "@/features/payment/types";

export async function getAdminPayments(): Promise<PaymentRecord[]> {
  const { data, error } = await supabase
    .from("payment_records")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updatePaymentStatus(
  paymentId: string,
  status: string,
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("update_payment_status", {
    p_payment_id: paymentId,
    p_status: status,
    p_gateway_txn_id: "",
    p_metadata: { admin_update: true, updated_at: new Date().toISOString() },
  });

  if (error) return { success: false, error: error.message };
  return data as { success: boolean; error?: string };
}

export async function getAdminVouchers() {
  const { data, error } = await supabase
    .from("marketplace_voucher_pool")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function seedAdminVoucher(
  productId: string,
  voucherCode: string,
  expiredAt?: string,
) {
  const { data, error } = await supabase
    .from("marketplace_voucher_pool")
    .insert({ product_id: productId, voucher_code: voucherCode, expired_at: expiredAt ?? null })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAdminVoucher(voucherId: string) {
  const { error } = await supabase.from("marketplace_voucher_pool").delete().eq("id", voucherId);
  if (error) throw error;
}
