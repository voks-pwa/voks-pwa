export const operationsKeys = {
  all: ["operations"] as const,
  health: () => [...operationsKeys.all, "health"] as const,
  featureFlags: () => [...operationsKeys.all, "feature-flags"] as const,
  maintenance: () => [...operationsKeys.all, "maintenance"] as const,
  version: () => [...operationsKeys.all, "version"] as const,
  auditLogs: (limit: number) => [...operationsKeys.all, "audit", limit] as const,
};
