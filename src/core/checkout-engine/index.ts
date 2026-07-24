import { debit } from "@/features/wallet";
import { validateTransaction } from "@/features/economy";
import { initiatePayment } from "@/features/payment";
import { recordEvent } from "@/features/commerce";
import { requestVoucher, confirmVoucherAssignment } from "@/features/marketplace-voucher";
import { getInventoryByProductId } from "@/features/marketplace";

export {
  debit,
  validateTransaction,
  initiatePayment,
  recordEvent,
  requestVoucher,
  confirmVoucherAssignment,
  getInventoryByProductId,
};
