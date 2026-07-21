import { supabase } from "@/lib/supabase";
import type { MarketplaceProduct } from "../types";

export async function getProducts(): Promise<MarketplaceProduct[]> {
  const { data, error } = await supabase
    .from("marketplace_products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getActiveProducts(): Promise<MarketplaceProduct[]> {
  const { data, error } = await supabase
    .from("marketplace_products")
    .select("*")
    .eq("is_active", true)
    .order("featured", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getProductById(id: string): Promise<MarketplaceProduct | null> {
  const { data, error } = await supabase
    .from("marketplace_products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getProductBySlug(slug: string): Promise<MarketplaceProduct | null> {
  const { data, error } = await supabase
    .from("marketplace_products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createProduct(input: {
  product_type: string;
  name: string;
  slug: string;
  price: number;
  category_id?: string;
  description?: string;
  original_price?: number;
  currency?: string;
  featured?: boolean;
  is_active?: boolean;
  reward_id?: number;
}): Promise<MarketplaceProduct> {
  const { data, error } = await supabase
    .from("marketplace_products")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(
  id: string,
  updates: Partial<{
    name: string;
    slug: string;
    price: number;
    category_id: string | null;
    description: string;
    original_price: number | null;
    currency: string;
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

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("marketplace_products").delete().eq("id", id);
  if (error) throw error;
}
