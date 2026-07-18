export const featureFlags = {
  mission: { public_enabled: false },
  reward: { public_enabled: false },
  admin: { public_enabled: true },
  campaign: { public_enabled: true },
  leaderboard: { public_enabled: true },
  notification: { public_enabled: true },
  wallet: { public_enabled: true },
} as const;

export type FeatureKey = keyof typeof featureFlags;

export function isFeatureEnabled(feature: FeatureKey): boolean {
  return featureFlags[feature].public_enabled;
}
