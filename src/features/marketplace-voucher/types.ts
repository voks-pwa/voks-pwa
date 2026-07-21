export type VoucherStatus = "AVAILABLE" | "RESERVED" | "ASSIGNED" | "USED" | "EXPIRED" | "VOID";

export interface MarketplaceVoucher {
  id: string;
  product_id: string;
  voucher_code: string;
  status: VoucherStatus;
  assigned_user: string | null;
  assigned_at: string | null;
  used_at: string | null;
  expired_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface VoucherActionResult {
  success: boolean;
  error?: string;
  voucher_id?: string;
  voucher_code?: string;
  action?: string;
}
