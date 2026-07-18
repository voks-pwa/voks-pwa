export const rewardAnalyticsKeys = {
  all: ["admin-reward-analytics"] as const,
  byDays: (days: number) => [...rewardAnalyticsKeys.all, days] as const,
};
