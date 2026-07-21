import { supabase } from "@/lib/supabase";
import { getInventoryByProductId } from "@/features/marketplace/repositories/inventoryRepository";
import {
  getCart,
  addToCart as addToCartRepo,
  removeFromCart as removeFromCartRepo,
  clearCart as clearCartRepo,
} from "../repositories/cartRepository";
import type { Cart } from "../types";

export async function addItemToCart(
  userId: string,
  productId: string,
  quantity: number = 1,
): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: "User ID required" };
  if (quantity <= 0) return { success: false, error: "Quantity must be positive" };

  const { data: product } = await supabase
    .from("marketplace_products")
    .select("id, name, product_type, price, is_active")
    .eq("id", productId)
    .maybeSingle();

  if (!product) return { success: false, error: "Product not found" };
  if (!product.is_active) return { success: false, error: "Product is not available" };

  const inventory = await getInventoryByProductId(productId);
  const available = inventory
    ? inventory.total_stock - inventory.reserved_stock
    : Infinity;
  const unlimited = inventory?.unlimited ?? true;

  if (!unlimited && available < quantity) {
    return { success: false, error: "Insufficient stock" };
  }

  return addToCartRepo(
    userId,
    productId,
    quantity,
    product.name,
    product.product_type,
    product.price,
  );
}

export async function getActiveCart(userId: string): Promise<Cart> {
  if (!userId) return { order: null, items: [], total: 0 };
  return getCart(userId);
}

export async function removeItemFromCart(
  userId: string,
  productId: string,
): Promise<{ success: boolean; error?: string }> {
  return removeFromCartRepo(userId, productId);
}

export async function clearActiveCart(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  return clearCartRepo(userId);
}

