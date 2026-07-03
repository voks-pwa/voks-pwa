export const profileKeys = {
  all: ["profiles"] as const,

  current: () =>
    [...profileKeys.all, "current"] as const,

  list: () =>
    [...profileKeys.all, "list"] as const,

  detail: (id: string) =>
    [...profileKeys.all, id] as const,
};