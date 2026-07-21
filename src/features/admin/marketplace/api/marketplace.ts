import { supabase } from "@/lib/supabase";
import type { MarketplaceProduct, MarketplaceCategory, MarketplaceInventory } from "@/features/marketplace/types";

export async function getAdminProducts(): Promise<MarketplaceProduct[]> {
  const { data, error } = await supabase
    .from("marketplace_products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createAdminProduct(input: {
  product_type: string;
  name: string;
  slug: string;
  price: number;
  category_id?: string;
  description?: string;
  original_price?: number;
  featured?: boolean;
}): Promise<MarketplaceProduct> {
  const { data, error } = await supabase
    .from("marketplace_products")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAdminProduct(
  id: string,
  updates: Partial<{
    name: string;
    slug: string;
    price: number;
    category_id: string | null;
    description: string;
    original_price: number | null;
    featured: boolean;
    is_active: boolean;
  }>,
): Promise<MarketplaceProduct> {
  const { data, error } = await supabase
    .from("marketplace_products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAdminProduct(id: string): Promise<void> {
  const { error } = await supabase.from("marketplace_products").delete().eq("id", id);
  if (error) throw error;
}

export async function getAdminCategories(): Promise<MarketplaceCategory[]> {
  const { data, error } = await supabase
    .from("marketplace_categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createAdminCategory(input: {
  name: string;
  slug: string;
  description?: string;
  sort_order?: number;
}): Promise<MarketplaceCategory> {
  const { data, error } = await supabase
    .from("marketplace_categories")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAdminCategory(
  id: string,
  updates: Partial<{
    name: string;
    slug: string;
    description: string;
    sort_order: number;
    is_active: boolean;
  }>,
): Promise<MarketplaceCategory> {
  const { data, error } = await supabase
    .from("marketplace_categories")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAdminCategory(id: string): Promise<void> {
  const { error } = await supabase.from("marketplace_categories").delete().eq("id", id);
  if (error) throw error;
}

export async function getAdminInventory(): Promise<MarketplaceInventory[]> {
  const { data, error } = await supabase
    .from("marketplace_inventory")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateAdminInventory(
  productId: string,
  updates: Partial<{
    total_stock: number;
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
