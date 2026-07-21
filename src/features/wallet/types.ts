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
  | "ROLLBACK"
  | "SYSTEM";

export type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED" | "ROLLED_BACK" | "EXPIRED";

export interface WalletLedgerEntry {
  id: number;
  amount: number;
  transaction_type: WalletTransactionType;
  reference_type: string;
  reference_id: string;
  description: string;
  transaction_key?: string;
  before_balance?: number;
  after_balance?: number;
  status?: TransactionStatus;
  created_at: string;
  updated_at?: string;
  rolled_back_at?: string;
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
  transaction_id?: number;
  before_balance?: number;
  after_balance?: number;
  duplicate?: boolean;
}

export interface CreateTransactionInput {
  userId: string;
  amount: number;
  transactionType: string;
  transactionKey: string;
  source?: string;
  referenceId?: string;
  description?: string;
}

export interface AdminTransactionResult {
  id: number;
  user_id: string;
  amount: number;
  transaction_type: string;
  source: string;
  reference_id: string;
  description: string;
  transaction_key: string;
  before_balance: number;
  after_balance: number;
  status: string;
  created_at: string;
  updated_at: string | null;
  rolled_back_at: string | null;
}
