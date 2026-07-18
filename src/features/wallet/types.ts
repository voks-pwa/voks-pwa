export type WalletTransactionType =
  | "MISSION_REWARD"
  | "ACHIEVEMENT_REWARD"
  | "CAMPAIGN_REWARD"
  | "CHECKIN"
  | "LISTEN"
  | "PROFILE"
  | "REFERRAL"
  | "SHARE"
  | "BONUS"
  | "PENALTY"
  | "REDEEM"
  | "REFUND"
  | "ADMIN_ADJUSTMENT"
  | "SYSTEM";

export interface WalletLedgerEntry {
  id: number;
  amount: number;
  transaction_type: WalletTransactionType;
  reference_type: string;
  reference_id: string;
  description: string;
  created_at: string;
}

export interface WalletBalance {
  balance: number;
  lifetime_vxp: number;
}

export interface WalletResult {
  success: boolean;
  error?: string;
  amount?: number;
  current_vxp?: number;
  lifetime_vxp?: number;
  balance?: number;
}
