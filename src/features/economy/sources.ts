import type { XpSource } from "./types";

export const XP_FALLBACKS: Record<XpSource, number> = {
  MISSION_COMPLETE: 150,
  MISSION_DAILY: 50,
  MISSION_WEEKLY: 200,
  MISSION_MONTHLY: 500,
  CAMPAIGN_COMPLETE: 300,
  CAMPAIGN_SHARE: 50,
  CAMPAIGN_JOIN: 25,
  REFERRAL_INVITE: 100,
  REFERRAL_REGISTER: 200,
  REFERRAL_FIRST_LOGIN: 50,
  ACHIEVEMENT_UNLOCK: 100,
  BADGE_UNLOCK: 150,
  LISTENING_MINUTE: 2,
  LISTENING_HOUR: 50,
  DAILY_LOGIN: 10,
  STREAK_LOGIN: 5,
  REWARD_CASHBACK: 10,
  ADMIN_ADJUSTMENT: 0,
  ADMIN_BONUS: 100,
};

export function getFallbackXP(source: XpSource): number {
  return XP_FALLBACKS[source] ?? 0;
}

export const XP_SOURCE_LABELS: Record<XpSource, string> = {
  MISSION_COMPLETE: "Mission Completion",
  MISSION_DAILY: "Daily Mission",
  MISSION_WEEKLY: "Weekly Mission",
  MISSION_MONTHLY: "Monthly Mission",
  CAMPAIGN_COMPLETE: "Campaign Complete",
  CAMPAIGN_SHARE: "Campaign Share",
  CAMPAIGN_JOIN: "Campaign Join",
  REFERRAL_INVITE: "Referral Invite",
  REFERRAL_REGISTER: "Referral Register",
  REFERRAL_FIRST_LOGIN: "Referral First Login",
  ACHIEVEMENT_UNLOCK: "Achievement Unlock",
  BADGE_UNLOCK: "Badge Unlock",
  LISTENING_MINUTE: "Listening Per Minute",
  LISTENING_HOUR: "Listening Hour",
  DAILY_LOGIN: "Daily Login",
  STREAK_LOGIN: "Streak Login Bonus",
  REWARD_CASHBACK: "Reward Cashback",
  ADMIN_ADJUSTMENT: "Admin Adjustment",
  ADMIN_BONUS: "Admin Bonus",
};
