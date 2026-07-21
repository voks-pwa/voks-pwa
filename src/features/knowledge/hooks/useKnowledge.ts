import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getKnowledgeArticles,
  getPublishedArticles,
  getKnowledgeArticleBySlug,
  createKnowledgeArticle,
  updateKnowledgeArticle,
  deleteKnowledgeArticle,
} from "../repositories/knowledgeRepository";
import { knowledgeKeys } from "../queries/knowledgeQueries";
import type { KnowledgeArticle, KnowledgeActionResult } from "../types";

export function useKnowledgeArticles() {
  return useQuery<KnowledgeArticle[]>({
    queryKey: knowledgeKeys.list(),
    queryFn: getKnowledgeArticles,
    staleTime: 60_000,
  });
}

export function usePublishedArticles() {
  return useQuery<KnowledgeArticle[]>({
    queryKey: knowledgeKeys.published(),
    queryFn: getPublishedArticles,
    staleTime: 120_000,
  });
}

export function useKnowledgeArticle(slug: string | undefined) {
  return useQuery<KnowledgeArticle | null>({
    queryKey: knowledgeKeys.slug(slug ?? ""),
    queryFn: () => getKnowledgeArticleBySlug(slug!),
    enabled: !!slug,
  });
}

export function useCreateKnowledgeArticle() {
  const queryClient = useQueryClient();

  return useMutation<KnowledgeArticle, Error, Parameters<typeof createKnowledgeArticle>[0]>({
    mutationFn: createKnowledgeArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.list() });
    },
  });
}

export function useUpdateKnowledgeArticle() {
  const queryClient = useQueryClient();

  return useMutation<KnowledgeArticle, Error, { id: string; updates: Partial<KnowledgeArticle> }>({
    mutationFn: ({ id, updates }) => updateKnowledgeArticle(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.all });
    },
  });
}

export function useDeleteKnowledgeArticle() {
  const queryClient = useQueryClient();

  return useMutation<KnowledgeActionResult, Error, string>({
    mutationFn: async (id) => {
      await deleteKnowledgeArticle(id);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.list() });
    },
  });
}
