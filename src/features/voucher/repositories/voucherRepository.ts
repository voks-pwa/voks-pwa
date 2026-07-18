import { supabase } from "@/lib/supabase";
import type { VoucherRecord, VoucherResult, VoucherStatus, VoucherType } from "../types";

export async function getAllVouchers(
  rewardId?: number,
): Promise<VoucherRecord[]> {
  let query = supabase.from("reward_voucher_pool").select("*");

  if (rewardId !== undefined) {
    query = query.eq("reward_id", rewardId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getVoucherById(
  voucherId: string,
): Promise<VoucherRecord | null> {
  const { data, error } = await supabase
    .from("reward_voucher_pool")
    .select("*")
    .eq("id", voucherId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getVouchersByStatus(
  status: VoucherStatus,
): Promise<VoucherRecord[]> {
  const { data, error } = await supabase
    .from("reward_voucher_pool")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getUserVouchers(
  userId: string,
): Promise<VoucherRecord[]> {
  const { data, error } = await supabase
    .from("reward_voucher_pool")
    .select("*")
    .eq("assigned_user", userId)
    .order("assigned_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function seedVoucher(input: {
  rewardId: number;
  voucherCode: string;
  voucherType: VoucherType;
  expiredAt?: string;
}): Promise<void> {
  const { error } = await supabase.from("reward_voucher_pool").insert({
    reward_id: input.rewardId,
    voucher_code: input.voucherCode,
    voucher_type: input.voucherType,
    expired_at: input.expiredAt ?? null,
  });

  if (error) throw error;
}

export async function seedVouchers(
  vouchers: Array<{
    rewardId: number;
    voucherCode: string;
    voucherType: VoucherType;
    expiredAt?: string;
  }>,
): Promise<void> {
  const rows = vouchers.map((v) => ({
    reward_id: v.rewardId,
    voucher_code: v.voucherCode,
    voucher_type: v.voucherType,
    expired_at: v.expiredAt ?? null,
  }));

  const { error } = await supabase.from("reward_voucher_pool").insert(rows);

  if (error) throw error;
}

export async function reserveVoucherRpc(
  rewardId: number,
): Promise<VoucherResult> {
  const { data, error } = await supabase.rpc("reserve_voucher", {
    p_reward_id: rewardId,
  });

  if (error) return { success: false, error: error.message };
  return data as VoucherResult;
}

export async function assignVoucherRpc(
  voucherId: string,
  userId: string,
): Promise<VoucherResult> {
  const { data, error } = await supabase.rpc("assign_voucher", {
    p_voucher_id: voucherId,
    p_user_id: userId,
  });

  if (error) return { success: false, error: error.message };
  return data as VoucherResult;
}

export async function markVoucherUsedRpc(
  voucherId: string,
): Promise<VoucherResult> {
  const { data, error } = await supabase.rpc("use_voucher", {
    p_voucher_id: voucherId,
  });

  if (error) return { success: false, error: error.message };
  return data as VoucherResult;
}

export async function refundVoucherRpc(
  voucherId: string,
): Promise<VoucherResult> {
  const { data, error } = await supabase.rpc("refund_voucher", {
    p_voucher_id: voucherId,
  });

  if (error) return { success: false, error: error.message };
  return data as VoucherResult;
}
