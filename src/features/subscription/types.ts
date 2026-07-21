export type PlanCode = "FREE" | "PREMIUM" | "VIP" | "CORPORATE";

export type BillingInterval = "MONTHLY" | "QUARTERLY" | "YEARLY";

export type SubscriptionStatus = "ACTIVE" | "GRACE" | "EXPIRED" | "CANCELLED" | "PAUSED";

export type InvoiceStatus = "PAID" | "PENDING" | "FAILED" | "REFUNDED";

export interface SubscriptionPlan {
  id: string;
  plan_code: PlanCode;
  name: string;
  description: string;
  billing_interval: BillingInterval;
  price: number;
  currency: string;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  auto_renew: boolean;
  cancelled_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionInvoice {
  id: string;
  user_id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: InvoiceStatus;
  wallet_txn_id: number | null;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}

export interface SubscriptionDetail {
  subscription_id: string;
  plan_code: PlanCode;
  plan_name: string;
  status: SubscriptionStatus;
  billing_interval: BillingInterval;
  price: number;
  currency: string;
  current_period_start: string;
  current_period_end: string;
  auto_renew: boolean;
}

export interface SubscriptionAnalytics {
  total_subscriptions: number;
  active_subscriptions: number;
  total_revenue: number;
  by_plan: PlanStat[];
}

export interface PlanStat {
  plan_code: PlanCode;
  name: string;
  subscriber_count: number;
}

export interface SubscriptionActionResult {
  success: boolean;
  error?: string;
  subscription_id?: string;
  plan_code?: PlanCode;
  period_end?: string;
}
