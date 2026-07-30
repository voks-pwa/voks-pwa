export type FavoriteTargetType = "program" | "announcer";

export interface UserFavorite {
  id: number;
  user_id: string;
  target_type: FavoriteTargetType;
  target_id: string;
  created_at: string;
}

export interface FavoriteInput {
  target_type: FavoriteTargetType;
  target_id: string;
}
