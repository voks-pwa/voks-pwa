import { useQuery } from "@tanstack/react-query";
import { getPopularMissions, getPopularRewards, getUserRecommendations } from "../repositories/recommendationRepository";
import { recommendationKeys } from "../queries/recommendationQueries";
import type { RecommendedMission, RecommendedReward, UserRecommendations } from "../types";

export function usePopularMissions(limit: number = 10) {
  return useQuery<RecommendedMission[]>({
    queryKey: recommendationKeys.popularMissions(limit),
    queryFn: () => getPopularMissions(limit),
    staleTime: 120_000,
  });
}

export function usePopularRewards(limit: number = 10) {
  return useQuery<RecommendedReward[]>({
    queryKey: recommendationKeys.popularRewards(limit),
    queryFn: () => getPopularRewards(limit),
    staleTime: 120_000,
  });
}

export function useUserRecommendations(userId: string | undefined, limit: number = 5) {
  return useQuery<UserRecommendations>({
    queryKey: recommendationKeys.userRecommendations(userId ?? "", limit),
    queryFn: () => getUserRecommendations(userId!, limit),
    enabled: !!userId,
    staleTime: 120_000,
  });
}
