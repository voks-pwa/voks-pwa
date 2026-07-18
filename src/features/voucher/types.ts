export type VoucherStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "ASSIGNED"
  | "USED"
  | "EXPIRED"
  | "VOID";

export type VoucherType =
  | "tokopedia"
  | "shopee"
  | "spotify"
  | "steam"
  | "google_play"
  | "internal"
  | "campaign";

export interface VoucherRecord {
  id: string;
  reward_id: number;
  voucher_code: string;
  voucher_type: VoucherType;
  status: VoucherStatus;
  assigned_user: string | null;
  assigned_at: string | null;
  used_at: string | null;
  expired_at: string | null;
  created_at: string;
}

export interface VoucherResult {
  success: boolean;
  error?: string;
  voucher_id?: string;
  voucher_code?: string;
  voucher_type?: string;
  action?: string;
}

export interface VoucherPoolInput {
  rewardId: number;
  voucherCode: string;
  voucherType: VoucherType;
  expiredAt?: string;
}

export interface AssignVoucherInput {
  voucherId: string;
  userId: string;
}
