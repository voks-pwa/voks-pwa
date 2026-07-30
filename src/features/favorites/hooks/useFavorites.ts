import { useQuery } from "@tanstack/react-query";

import { getUserFavorites, checkIsFavorited } from "../services/favoriteService";
import { favoriteKeys } from "../queries/favoriteQueries";
import { useToggleFavorite } from "../mutations/favoriteMutations";
import { useAuth } from "@/features/auth/useAuth";
import type { FavoriteTargetType } from "../types";

export function useUserFavorites(targetType?: FavoriteTargetType) {
  const { user } = useAuth();

  return useQuery({
    queryKey: user?.id
      ? favoriteKeys.list(user.id)
      : ["favorites", "empty"],
    enabled: !!user,
    queryFn: () =>
      user ? getUserFavorites(user.id, targetType) : [],
  });
}

export function useIsFavorited(
  targetType: FavoriteTargetType,
  targetId: string,
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: user?.id
      ? favoriteKeys.detail(user.id, targetType, targetId)
      : ["favorites", "empty"],
    enabled: !!user && !!targetId,
    queryFn: () =>
      user
        ? checkIsFavorited(user.id, targetType, targetId)
        : false,
  });
}

export function useToggleFavoriteMutation() {
  return useToggleFavorite();
}
