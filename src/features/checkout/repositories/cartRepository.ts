import { supabase } from "@/lib/supabase";
import type { Cart } from "../types";

export async function getCart(userId: string): Promise<Cart> {
  const { data, error } = await supabase.rpc("get_cart", {
    p_user_id: userId,
  });

  if (error) {
    return { order: null, items: [], total: 0 };
  }

  const result = data as { order: Cart["order"]; items: Cart["items"]; total: number };
  return {
    order: result.order,
    items: result.items ?? [],
    total: result.total ?? 0,
  };
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity: number,
  productName: string,
  productType: string,
  unitPrice: number,
): Promise<{ success: boolean; error?: string; order_id?: string }> {
  const { data, error } = await supabase.rpc("add_to_cart", {
    p_user_id: userId,
    p_product_id: productId,
    p_quantity: quantity,
    p_product_name: productName,
    p_product_type: productType,
    p_unit_price: unitPrice,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data as { success: boolean; error?: string; order_id?: string };
}

export async function removeFromCart(
  userId: string,
  productId: string,
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("remove_from_cart", {
    p_user_id: userId,
    p_product_id: productId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data as { success: boolean; error?: string };
}

export async function clearCart(userId: string): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("clear_cart", {
    p_user_id: userId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data as { success: boolean; error?: string };
}
