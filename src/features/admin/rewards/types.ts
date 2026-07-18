export interface RewardProfile {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  level: number;
  badge_name: string;
}

export interface RewardRedemption {
  id: string;
  user_id: string;

  reward_wp_id: string | null;

  reward_slug: string;

  reward_name: string;

  reward_cost: number;

  reward_status:
    | "pending"
    | "approved"
    | "completed"
    | "rejected";

  redeemed_at: string;

  approved_at: string | null;

  completed_at: string | null;

  notes: string | null;

  reward_snapshot:
    | Record<string, unknown>
    | null;

  profile: RewardProfile | null;
}