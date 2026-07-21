import { supabase } from "@/lib/supabase";
import type { MarketplaceVoucher, VoucherActionResult } from "../types";

export async function reserveVoucher(productId: string): Promise<VoucherActionResult> {
  const { data, error } = await supabase.rpc("reserve_marketplace_voucher", {
    p_product_id: productId,
  });

  if (error) return { success: false, error: error.message };
  return data as VoucherActionResult;
}

export async function assignVoucher(voucherId: string, userId: string): Promise<VoucherActionResult> {
  const { data, error } = await supabase.rpc("assign_marketplace_voucher", {
    p_voucher_id: voucherId,
    p_user_id: userId,
  });

  if (error) return { success: false, error: error.message };
  return data as VoucherActionResult;
}

export async function markVoucherUsed(voucherId: string): Promise<VoucherActionResult> {
  const { data, error } = await supabase.rpc("use_marketplace_voucher", {
    p_voucher_id: voucherId,
  });

  if (error) return { success: false, error: error.message };
  return data as VoucherActionResult;
}

export async function refundVoucher(voucherId: string): Promise<VoucherActionResult> {
  const { data, error } = await supabase.rpc("refund_marketplace_voucher", {
    p_voucher_id: voucherId,
  });

  if (error) return { success: false, error: error.message };
  return data as VoucherActionResult;
}

export async function getAllVouchers(): Promise<MarketplaceVoucher[]> {
  const { data, error } = await supabase
    .from("marketplace_voucher_pool")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getAvailableVouchers(productId: string): Promise<MarketplaceVoucher[]> {
  const { data, error } = await supabase
    .from("marketplace_voucher_pool")
    .select("*")
    .eq("product_id", productId)
    .eq("status", "AVAILABLE")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getUserVouchers(userId: string): Promise<MarketplaceVoucher[]> {
  const { data, error } = await supabase
    .from("marketplace_voucher_pool")
    .select("*")
    .eq("assigned_user", userId)
    .order("assigned_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function seedVoucher(
  productId: string,
  voucherCode: string,
  expiredAt?: string,
): Promise<VoucherActionResult> {
  const { data, error } = await supabase
    .from("marketplace_voucher_pool")
    .insert({ product_id: productId, voucher_code: voucherCode, expired_at: expiredAt ?? null })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, voucher_id: data.id, voucher_code: data.voucher_code };
}
