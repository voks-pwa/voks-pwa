import { supabase } from "@/lib/supabase";
import type { SearchResult } from "../types";

export async function searchContent(query: string): Promise<SearchResult[]> {
  const { data, error } = await supabase.rpc("search_content", { p_query: query });
  if (error) throw error;
  const result = data as unknown as { success: boolean; error?: string; results: SearchResult[] };
  if (!result.success) throw new Error(result.error ?? "search_content failed");
  return result.results ?? [];
}
