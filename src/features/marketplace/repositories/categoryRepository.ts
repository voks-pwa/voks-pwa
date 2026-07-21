import { supabase } from "@/lib/supabase";
import type { MarketplaceCategory } from "../types";

export async function getCategories(): Promise<MarketplaceCategory[]> {
  const { data, error } = await supabase
    .from("marketplace_categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getCategoryById(id: string): Promise<MarketplaceCategory | null> {
  const { data, error } = await supabase
    .from("marketplace_categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getCategoryBySlug(slug: string): Promise<MarketplaceCategory | null> {
  const { data, error } = await supabase
    .from("marketplace_categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createCategory(input: {
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
}): Promise<MarketplaceCategory> {
  const { data, error } = await supabase
    .from("marketplace_categories")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(
  id: string,
  updates: Partial<{
    name: string;
    slug: string;
    description: string;
    parent_id: string | null;
    image_url: string;
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

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("marketplace_categories").delete().eq("id", id);
  if (error) throw error;
}
