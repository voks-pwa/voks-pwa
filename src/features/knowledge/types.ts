export interface KnowledgeArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeActionResult {
  success: boolean;
  error?: string;
}
