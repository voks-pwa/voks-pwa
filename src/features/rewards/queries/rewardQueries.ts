export const rewardKeys = {
  all: ["reward-catalog"] as const,
  active: ["reward-catalog", "active"] as const,
  bySlug: (slug: string) => ["reward-catalog", slug] as const,
  byId: (id: number) => ["reward-catalog", id] as const,
};
