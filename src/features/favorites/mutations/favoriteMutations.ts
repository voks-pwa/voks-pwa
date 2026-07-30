import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { toggleFavorite } from "../services/favoriteService";
import { favoriteKeys } from "../queries/favoriteQueries";
import type { FavoriteTargetType } from "../types";

type TogglePayload = {
  userId: string;
  targetType: FavoriteTargetType;
  targetId: string;
};

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, targetType, targetId }: TogglePayload) =>
      toggleFavorite(userId, targetType, targetId),

    onSuccess: (_, { userId, targetType, targetId }) => {
      queryClient.invalidateQueries({
        queryKey: favoriteKeys.list(userId),
      });

      queryClient.invalidateQueries({
        queryKey: favoriteKeys.detail(
          userId,
          targetType,
          targetId,
        ),
      });
    },
  });
}
