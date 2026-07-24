import {
  reserveVoucherRpc,
  assignVoucherRpc,
  markVoucherUsedRpc,
  refundVoucherRpc,
  getAllVouchers,
  getVoucherById,
  getUserVouchers,
  getVouchersByStatus,
  seedVoucher,
  seedVouchers,
} from "../repositories/voucherRepository";
import { track } from "@/core/action-engine/engine";
import type { VoucherRecord, VoucherResult, VoucherPoolInput } from "../types";

export async function requestVoucher(
  rewardId: number,
): Promise<VoucherResult> {
  const result = await reserveVoucherRpc(rewardId);
  return result;
}

export async function assignVoucher(
  voucherId: string,
  userId: string,
): Promise<VoucherResult> {
  const result = await assignVoucherRpc(voucherId, userId);

  if (result.success) {
    try {
      await track("VOUCHER_ASSIGNED", userId, {
        voucher_id: voucherId,
        voucher_code: result.voucher_code ?? "",
      });
    } catch {
      /* notification failure does not block */
    }
  }

  return result;
}

export async function markVoucherUsed(voucherId: string): Promise<VoucherResult> {
  return markVoucherUsedRpc(voucherId);
}

export async function refundVoucher(voucherId: string): Promise<VoucherResult> {
  const result = await refundVoucherRpc(voucherId);

  if (result.success) {
    try {
      const voucher = await getVoucherById(voucherId);
      if (voucher?.assigned_user) {
        await track("VOUCHER_REFUND", voucher.assigned_user, {
          voucher_id: voucherId,
          action: result.action ?? "",
        });
      }
    } catch {
      /* notification failure does not block */
    }
  }

  return result;
}

export async function addVouchersToPool(
  vouchers: VoucherPoolInput[],
): Promise<void> {
  await seedVouchers(
    vouchers.map((v) => ({
      rewardId: v.rewardId,
      voucherCode: v.voucherCode,
      voucherType: v.voucherType,
      expiredAt: v.expiredAt,
    })),
  );
}

export async function addVoucherToPool(input: VoucherPoolInput): Promise<void> {
  await seedVoucher(input);
}

export async function getVoucherHistory(
  rewardId?: number,
): Promise<VoucherRecord[]> {
  return getAllVouchers(rewardId);
}

export async function getUserAssignedVouchers(
  userId: string,
): Promise<VoucherRecord[]> {
  return getUserVouchers(userId);
}

export async function getAvailableVouchers(): Promise<VoucherRecord[]> {
  return getVouchersByStatus("AVAILABLE");
}

export async function getVoucherDetail(
  voucherId: string,
): Promise<VoucherRecord | null> {
  return getVoucherById(voucherId);
}
