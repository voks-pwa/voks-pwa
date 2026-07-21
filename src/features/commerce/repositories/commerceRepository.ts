import { supabase } from "@/lib/supabase";
import type { CommerceEvent, MarketplaceFulfillment, RefundRecord, CommerceAnalytics, CommerceActionResult } from "../types";

export async function recordEventRpc(
  eventType: string,
  userId?: string,
  orderId?: string,
  productId?: string,
  amount?: number,
  metadata?: Record<string, unknown>,
): Promise<CommerceActionResult> {
  const { data, error } = await supabase.rpc("record_commerce_event", {
    p_event_type: eventType,
    p_user_id: userId ?? null,
    p_order_id: orderId ?? null,
    p_product_id: productId ?? null,
    p_amount: amount ?? 0,
    p_metadata: metadata ?? {},
  });

  if (error) return { success: false, error: error.message };
  return data as CommerceActionResult;
}

export async function createFulfillmentRpc(orderId: string): Promise<CommerceActionResult> {
  const { data, error } = await supabase.rpc("create_fulfillment", { p_order_id: orderId });
  if (error) return { success: false, error: error.message };
  return data as CommerceActionResult;
}

export async function updateFulfillmentStatusRpc(
  fulfillmentId: string,
  status: string,
  trackingNumber?: string,
  carrier?: string,
  notes?: string,
): Promise<CommerceActionResult> {
  const { data, error } = await supabase.rpc("update_fulfillment_status", {
    p_fulfillment_id: fulfillmentId,
    p_status: status,
    p_tracking_number: trackingNumber ?? "",
    p_carrier: carrier ?? "",
    p_notes: notes ?? "",
  });
  if (error) return { success: false, error: error.message };
  return data as CommerceActionResult;
}

export async function processRefundRpc(
  refundId: string,
  status: string,
  processedBy?: string,
): Promise<CommerceActionResult> {
  const { data, error } = await supabase.rpc("process_refund", {
    p_refund_id: refundId,
    p_status: status,
    p_processed_by: processedBy ?? null,
  });
  if (error) return { success: false, error: error.message };
  return data as CommerceActionResult;
}

export async function getCommerceAnalyticsRpc(days?: number): Promise<CommerceAnalytics & { success?: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("get_commerce_analytics", {
    p_days: days ?? 30,
  });
  if (error) return { success: false, error: error.message, revenue: 0, total_orders: 0, fulfillments: 0, refunds: 0, refund_amount: 0, top_products: [], daily_events: [] };
  return data as CommerceAnalytics & { success?: boolean; error?: string };
}

export async function getFulfillmentById(fulfillmentId: string): Promise<MarketplaceFulfillment | null> {
  const { data, error } = await supabase
    .from("marketplace_fulfillment")
    .select("*")
    .eq("id", fulfillmentId)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function getAllFulfillments(): Promise<MarketplaceFulfillment[]> {
  const { data, error } = await supabase
    .from("marketplace_fulfillment")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getFulfillmentByOrder(orderId: string): Promise<MarketplaceFulfillment | null> {
  const { data, error } = await supabase
    .from("marketplace_fulfillment")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function getRefundById(refundId: string): Promise<RefundRecord | null> {
  const { data, error } = await supabase
    .from("refund_records")
    .select("*")
    .eq("id", refundId)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function getAllRefunds(): Promise<RefundRecord[]> {
  const { data, error } = await supabase
    .from("refund_records")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getRefundsByOrder(orderId: string): Promise<RefundRecord[]> {
  const { data, error } = await supabase
    .from("refund_records")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function createRefundRecord(
  orderId: string,
  userId: string,
  amount: number,
  reason: string,
  refundMethod?: string,
): Promise<RefundRecord | null> {
  const { data, error } = await supabase
    .from("refund_records")
    .insert({
      order_id: orderId,
      user_id: userId,
      amount,
      reason,
      refund_method: refundMethod ?? "WALLET",
      status: "PENDING",
    })
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function getAllCommerceEvents(days?: number): Promise<CommerceEvent[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (days ?? 30));

  const { data, error } = await supabase
    .from("commerce_events")
    .select("*")
    .gte("created_at", cutoff.toISOString())
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}
