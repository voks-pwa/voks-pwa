export const knowledgeKeys = {
  all: ["knowledge"] as const,
  list: () => [...knowledgeKeys.all, "list"] as const,
  published: () => [...knowledgeKeys.all, "published"] as const,
  slug: (slug: string) => [...knowledgeKeys.all, "slug", slug] as const,
};
