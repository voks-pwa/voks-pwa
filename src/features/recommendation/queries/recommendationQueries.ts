export const recommendationKeys = {
  all: ["recommendations"] as const,
  popularMissions: (limit: number) => [...recommendationKeys.all, "popular-missions", limit] as const,
  popularRewards: (limit: number) => [...recommendationKeys.all, "popular-rewards", limit] as const,
  userRecommendations: (userId: string, limit: number) => [...recommendationKeys.all, "user", userId, limit] as const,
};
