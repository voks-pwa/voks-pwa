export const analyticsKeys = {
  all: ["analytics"] as const,
  wallet: (days: number) => [...analyticsKeys.all, "wallet", days] as const,
  campaign: (days: number) => [...analyticsKeys.all, "campaign", days] as const,
  commerceKpis: (days: number) => [...analyticsKeys.all, "commerce-kpis", days] as const,
  admin: (days: number) => [...analyticsKeys.all, "admin", days] as const,
};
