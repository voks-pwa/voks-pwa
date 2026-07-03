export interface RewardRedemption {
  id: string;

  user_id: string;

  reward_wp_id: string;

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
}