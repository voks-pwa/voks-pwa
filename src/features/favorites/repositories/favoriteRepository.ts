import { supabase } from "@/lib/supabase";
import type { UserFavorite, FavoriteTargetType } from "../types";

export async function findUserFavorites(
  userId: string,
  targetType?: FavoriteTargetType,
): Promise<UserFavorite[]> {
  let query = supabase
    .from("user_favorites")
    .select("*")
    .eq("user_id", userId);

  if (targetType) {
    query = query.eq("target_type", targetType);
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) throw error;

  return (data as UserFavorite[]) ?? [];
}

export async function isFavorited(
  userId: string,
  targetType: FavoriteTargetType,
  targetId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .maybeSingle();

  if (error) throw error;

  return !!data;
}

export async function addFavorite(
  userId: string,
  targetType: FavoriteTargetType,
  targetId: string,
): Promise<UserFavorite | null> {
  const { data, error } = await supabase
    .from("user_favorites")
    .insert({
      user_id: userId,
      target_type: targetType,
      target_id: targetId,
    })
    .select()
    .maybeSingle();

  if (error) throw error;

  return (data as UserFavorite | null) ?? null;
}

export async function removeFavorite(
  userId: string,
  targetType: FavoriteTargetType,
  targetId: string,
): Promise<void> {
  const { error } = await supabase
    .from("user_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("target_type", targetType)
    .eq("target_id", targetId);

  if (error) throw error;
}
