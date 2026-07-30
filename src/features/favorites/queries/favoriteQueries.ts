export const favoriteKeys = {
  all: ["favorites"] as const,

  list: (userId: string) =>
    [...favoriteKeys.all, userId, "list"] as const,

  detail: (userId: string, targetType: string, targetId: string) =>
    [
      ...favoriteKeys.all,
      userId,
      targetType,
      targetId,
    ] as const,
};
