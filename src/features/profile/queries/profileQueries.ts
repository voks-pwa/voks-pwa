export const profileKeys = {
  all: ["profiles"] as const,

  list: () =>
    [...profileKeys.all, "list"] as const,

  detail: (id: string) =>
    [...profileKeys.all, id] as const,
};
