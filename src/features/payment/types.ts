export type PaymentMethod = "VXP" | "MIDTRANS" | "XENDIT" | "QRIS" | "BANK_TRANSFER" | "CREDIT_CARD";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | "EXPIRED";

export interface PaymentRecord {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  gateway: string;
  gateway_txn_id: string;
  idempotency_key: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PaymentResult {
  success: boolean;
  error?: string;
  payment_id?: string;
  payment_method?: string;
  amount?: number;
  redirect_url?: string;
  idempotency_key?: string;
}

export interface WebhookPayload {
  gateway: string;
  event_type: string;
  order_id?: string;
  payment_id?: string;
  gateway_txn_id?: string;
  status?: string;
  signature?: string;
  raw: Record<string, unknown>;
}
