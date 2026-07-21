export interface RecommendedMission {
  mission_id: number;
  title: string;
  description?: string;
  vxp?: number;
  completion_count?: number;
}

export interface RecommendedReward {
  reward_id: number;
  name: string;
  cost: number;
  redeem_count: number;
  image_url: string | null;
}

export interface UserRecommendations {
  recommended_missions: RecommendedMission[];
  popular_missions: RecommendedMission[];
  redeemed_count: number;
}

export interface RecommendationResult<T> {
  success: boolean;
  error?: string;
  data?: T;
}
