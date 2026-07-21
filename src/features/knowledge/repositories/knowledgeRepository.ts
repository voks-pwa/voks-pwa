import { supabase } from "@/lib/supabase";
import type { KnowledgeArticle } from "../types";

export async function getKnowledgeArticles(): Promise<KnowledgeArticle[]> {
  const { data, error } = await supabase
    .from("knowledge_articles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as KnowledgeArticle[];
}

export async function getPublishedArticles(): Promise<KnowledgeArticle[]> {
  const { data, error } = await supabase
    .from("knowledge_articles")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as KnowledgeArticle[];
}

export async function getKnowledgeArticleBySlug(slug: string): Promise<KnowledgeArticle | null> {
  const { data, error } = await supabase
    .from("knowledge_articles")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return data as KnowledgeArticle | null;
}

export async function createKnowledgeArticle(article: {
  title: string;
  slug: string;
  content: string;
  category?: string;
  tags?: string[];
  published?: boolean;
}): Promise<KnowledgeArticle> {
  const { data, error } = await supabase
    .from("knowledge_articles")
    .insert(article)
    .select()
    .single();
  if (error) throw error;
  return data as KnowledgeArticle;
}

export async function updateKnowledgeArticle(id: string, updates: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> {
  const { data, error } = await supabase
    .from("knowledge_articles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as KnowledgeArticle;
}

export async function deleteKnowledgeArticle(id: string): Promise<void> {
  const { error } = await supabase
    .from("knowledge_articles")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
