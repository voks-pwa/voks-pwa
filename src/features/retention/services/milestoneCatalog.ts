export interface MilestoneDefinition {
  key: string;
  name: string;
  metric: "xp" | "missions" | "referrals" | "listening_hours" | "shares" | "profile";
  threshold: number;
  reward_vxp: number;
}

/**
 * Static milestone catalog (Future Ready).
 * Thresholds per AI/70: 100/500/1000/5000/10000 XP, mission counts,
 * referral counts, listening hours, share count, profile complete.
 */
export const MILESTONE_CATALOG: MilestoneDefinition[] = [
  { key: "xp-100", name: "100 XP", metric: "xp", threshold: 100, reward_vxp: 20 },
  { key: "xp-500", name: "500 XP", metric: "xp", threshold: 500, reward_vxp: 50 },
  { key: "xp-1000", name: "1.000 XP", metric: "xp", threshold: 1000, reward_vxp: 100 },
  { key: "xp-5000", name: "5.000 XP", metric: "xp", threshold: 5000, reward_vxp: 300 },
  { key: "xp-10000", name: "10.000 XP", metric: "xp", threshold: 10000, reward_vxp: 600 },

  { key: "missions-10", name: "10 Missions", metric: "missions", threshold: 10, reward_vxp: 50 },
  { key: "missions-25", name: "25 Missions", metric: "missions", threshold: 25, reward_vxp: 120 },
  { key: "missions-100", name: "100 Missions", metric: "missions", threshold: 100, reward_vxp: 400 },

  { key: "referrals-10", name: "10 Referrals", metric: "referrals", threshold: 10, reward_vxp: 200 },
  { key: "shares-50", name: "50 Shares", metric: "shares", threshold: 50, reward_vxp: 150 },
  { key: "listening-100h", name: "100 Listening Hours", metric: "listening_hours", threshold: 100, reward_vxp: 250 },
  { key: "profile-complete", name: "Profile Complete", metric: "profile", threshold: 1, reward_vxp: 30 },
];

export interface MilestoneMetricReader {
  (metric: MilestoneDefinition["metric"], userId: string): Promise<number>;
}
