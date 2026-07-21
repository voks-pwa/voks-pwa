export type { MarketplaceVoucher, VoucherStatus, VoucherActionResult } from "./types";

export {
  reserveVoucher,
  assignVoucher,
  markVoucherUsed,
  refundVoucher,
  getAvailableVouchers,
  getUserVouchers,
  getAllVouchers,
  seedVoucher,
} from "./repositories/marketplaceVoucherRepository";

export {
  requestVoucher,
  confirmVoucherAssignment,
  useVoucherCode,
  returnVoucher,
} from "./services/marketplaceVoucherService";

export {
  useMarketplaceVoucherPool,
  useUserMarketplaceVouchers,
  useAvailableMarketplaceVouchers,
  useRequestMarketplaceVoucher,
} from "./hooks/useMarketplaceVoucher";
