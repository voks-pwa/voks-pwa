import {
  findUserFavorites,
  isFavorited as isFavoritedRepo,
  addFavorite as addFavoriteRepo,
  removeFavorite as removeFavoriteRepo,
} from "../repositories/favoriteRepository";
import type { UserFavorite, FavoriteTargetType } from "../types";
import { track } from "@/core/action-engine";

export const getUserFavorites = findUserFavorites;

export async function checkIsFavorited(
  userId: string,
  targetType: FavoriteTargetType,
  targetId: string,
): Promise<boolean> {
  return isFavoritedRepo(userId, targetType, targetId);
}

export async function toggleFavorite(
  userId: string,
  targetType: FavoriteTargetType,
  targetId: string,
): Promise<UserFavorite | null> {
  const alreadyFavorited = await isFavoritedRepo(
    userId,
    targetType,
    targetId,
  );

  if (alreadyFavorited) {
    await removeFavoriteRepo(userId, targetType, targetId);
    return null;
  }

  const favorite = await addFavoriteRepo(
    userId,
    targetType,
    targetId,
  );

  if (favorite) {
    const eventName =
      targetType === "program"
        ? "FAVORITE_PROGRAM"
        : "FAVORITE_ANNOUNCER";

    track(
      eventName,
      userId,
      {
        target_id: targetId,
        timestamp: new Date().toISOString(),
      },
    );
  }

  return favorite;
}
