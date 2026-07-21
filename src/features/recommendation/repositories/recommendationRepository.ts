import { supabase } from "@/lib/supabase";
import type { RecommendedMission, RecommendedReward, UserRecommendations } from "../types";

export async function getPopularMissions(limit: number = 10): Promise<RecommendedMission[]> {
  const { data, error } = await supabase.functions.invoke("recommendation-engine", {
    body: { type: "popular-missions", limit },
  });
  if (error) throw error;
  if (!data.success) throw new Error(data.error ?? "getPopularMissions failed");
  return data.data as RecommendedMission[];
}

export async function getPopularRewards(limit: number = 10): Promise<RecommendedReward[]> {
  const { data, error } = await supabase.functions.invoke("recommendation-engine", {
    body: { type: "popular-rewards", limit },
  });
  if (error) throw error;
  if (!data.success) throw new Error(data.error ?? "getPopularRewards failed");
  return data.data as RecommendedReward[];
}

export async function getUserRecommendations(userId: string, limit: number = 5): Promise<UserRecommendations> {
  const { data, error } = await supabase.functions.invoke("recommendation-engine", {
    body: { type: "personalized", user_id: userId, limit },
  });
  if (error) throw error;
  if (!data.success) throw new Error(data.error ?? "getUserRecommendations failed");
  return data.data as UserRecommendations;
}
