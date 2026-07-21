export interface SearchResult {
  content_type: "knowledge" | "mission" | "reward" | "program";
  content_id: string;
  title: string;
  subtitle?: string | null;
  excerpt?: string | null;
}

export interface SearchResponse {
  success: boolean;
  error?: string;
  results: SearchResult[];
  query: string;
}
