import { useQuery } from "@tanstack/react-query";
import { getRewardAggregate, getActiveRewardAggregate, getRewardAggregateBySlug } from "../repositories/rewardAggregateRepository";

export function useRewardAggregate() {
  return useQuery({
    queryKey: ["reward-aggregate"],
    queryFn: getRewardAggregate,
    staleTime: 60_000,
  });
}

export function useActiveRewardAggregate() {
  return useQuery({
    queryKey: ["reward-aggregate", "active"],
    queryFn: getActiveRewardAggregate,
    staleTime: 60_000,
  });
}

export function useRewardAggregateBySlug(slug: string) {
  return useQuery({
    queryKey: ["reward-aggregate", slug],
    queryFn: () => getRewardAggregateBySlug(slug),
    enabled: !!slug,
    staleTime: 60_000,
  });
}
