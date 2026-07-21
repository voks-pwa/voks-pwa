import { supabase } from "@/lib/supabase";
import type { CartItem } from "../types";

export async function lockOrderInventory(
  orderId: string,
): Promise<{ success: boolean; error?: string; product_id?: string }> {
  const { data, error } = await supabase.rpc("lock_inventory", {
    p_order_id: orderId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data as { success: boolean; error?: string; product_id?: string };
}

export async function releaseOrderInventory(
  orderId: string,
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("release_inventory", {
    p_order_id: orderId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data as { success: boolean; error?: string };
}

export async function deductOrderInventory(
  orderId: string,
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("deduct_inventory", {
    p_order_id: orderId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data as { success: boolean; error?: string };
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("marketplace_orders")
    .update({ order_status: status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getOrderItems(
  orderId: string,
): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("marketplace_order_items")
    .select("*")
    .eq("order_id", orderId);

  if (error) return [];
  return data ?? [];
}
