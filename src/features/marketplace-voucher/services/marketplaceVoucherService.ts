import {
  reserveVoucher as reserveVoucherRepo,
  assignVoucher as assignVoucherRepo,
  markVoucherUsed,
  refundVoucher,
} from "../repositories/marketplaceVoucherRepository";
import type { VoucherActionResult } from "../types";

export async function requestVoucher(productId: string): Promise<VoucherActionResult> {
  const result = await reserveVoucherRepo(productId);
  if (!result.success) {
    return { success: false, error: result.error ?? "No voucher available" };
  }
  return result;
}

export async function confirmVoucherAssignment(
  voucherId: string,
  userId: string,
): Promise<VoucherActionResult> {
  return assignVoucherRepo(voucherId, userId);
}

export async function useVoucherCode(voucherId: string): Promise<VoucherActionResult> {
  return markVoucherUsed(voucherId);
}

export async function returnVoucher(voucherId: string): Promise<VoucherActionResult> {
  return refundVoucher(voucherId);
}
