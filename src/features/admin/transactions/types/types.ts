export interface TransactionProfile {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  level: number;
  badge_name: string;
}

export interface AdminTransaction {
  id: string;
  user_id: string;

  amount: number;

  transaction_type: string;

  reason: string;

  reference_id: string | null;

  created_at: string;

  profile: TransactionProfile | null;
}