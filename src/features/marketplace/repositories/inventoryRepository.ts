import { supabase } from "@/lib/supabase";
import type { MarketplaceInventory } from "../types";

export async function getInventory(): Promise<MarketplaceInventory[]> {
  const { data, error } = await supabase
    .from("marketplace_inventory")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getInventoryByProductId(productId: string): Promise<MarketplaceInventory | null> {
  const { data, error } = await supabase
    .from("marketplace_inventory")
    .select("*")
    .eq("product_id", productId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateInventory(
  productId: string,
  updates: Partial<{
    total_stock: number;
    reserved_stock: number;
    warning_stock: number;
    unlimited: boolean;
  }>,
): Promise<MarketplaceInventory> {
  const { data, error } = await supabase
    .from("marketplace_inventory")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("product_id", productId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
