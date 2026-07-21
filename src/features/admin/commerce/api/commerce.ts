import { supabase } from "@/lib/supabase";
import type { MarketplaceFulfillment, RefundRecord } from "@/features/commerce/types";

export async function getAdminFulfillments(): Promise<MarketplaceFulfillment[]> {
  const { data, error } = await supabase
    .from("marketplace_fulfillment")
    .select("*, marketplace_orders!inner(user_id, order_status, total_amount)")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getAdminRefunds(): Promise<RefundRecord[]> {
  const { data, error } = await supabase
    .from("refund_records")
    .select("*, marketplace_orders!inner(order_status)")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}
