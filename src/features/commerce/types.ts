export type CommerceEventType =
  | "purchase"
  | "payment_complete"
  | "fulfillment_started"
  | "fulfillment_shipped"
  | "fulfillment_delivered"
  | "fulfillment_completed"
  | "fulfillment_cancelled"
  | "refund_completed"
  | "voucher_use"
  | "shipping_update";

export type FulfillmentStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "COMPLETED" | "CANCELLED";

export type RefundStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";

export type RefundMethod = "WALLET" | "GATEWAY";

export interface CommerceEvent {
  id: string;
  event_type: CommerceEventType;
  user_id: string | null;
  order_id: string | null;
  product_id: string | null;
  amount: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface MarketplaceFulfillment {
  id: string;
  order_id: string;
  status: FulfillmentStatus;
  tracking_number: string;
  carrier: string;
  notes: string;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
}

export interface RefundRecord {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  refund_method: RefundMethod;
  processed_by: string | null;
  processed_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CommerceAnalytics {
  revenue: number;
  total_orders: number;
  fulfillments: number;
  refunds: number;
  refund_amount: number;
  top_products: TopProduct[];
  daily_events: DailyEvent[];
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  total_qty: number;
  total_revenue: number;
}

export interface DailyEvent {
  day: string;
  event_type: string;
  count: number;
}

export interface CommerceActionResult {
  success: boolean;
  error?: string;
  event_id?: string;
  fulfillment_id?: string;
  refund_id?: string;
  status?: string;
  order_status?: string;
}
