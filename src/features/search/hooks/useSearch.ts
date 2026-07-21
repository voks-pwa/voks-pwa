import { useQuery } from "@tanstack/react-query";
import { searchContent } from "../repositories/searchRepository";
import { searchKeys } from "../queries/searchQueries";
import type { SearchResult } from "../types";

export function useSearch(query: string) {
  return useQuery<SearchResult[]>({
    queryKey: searchKeys.query(query),
    queryFn: () => searchContent(query),
    enabled: query.length >= 2,
    staleTime: 60_000,
  });
}
