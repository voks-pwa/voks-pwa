export const analyticsKeys = {
  all: ["admin-analytics"] as const,

  byDays: (days: number) => [...analyticsKeys.all, days] as const,
};
