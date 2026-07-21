export type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED" | "ROLLED_BACK" | "EXPIRED";

export interface AdminTransaction {
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

export interface AdminTransactionsResponse {
  data: AdminTransaction[];
  total: number;
}

export interface TransactionFilters {
  status?: string;
  userId?: string;
  source?: string;
  page?: number;
  pageSize?: number;
}
