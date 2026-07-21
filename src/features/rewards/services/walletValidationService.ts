import { getCanonicalUser } from "@/features/profile/services/userCanonicalService";
import { getCampaignBySlug } from "@/features/campaigns/repositories/campaignRepository";
import { getEarnedAchievements } from "@/features/retention/repositories/achievementRepository";
import { deriveCampaignStatus, isCampaignVisible } from "@/features/campaigns/services/campaignStatus";

import type { RewardAggregate } from "../types/rewardAggregate";

export interface EligibilityResult {
  eligible: boolean;
  reason: string;
}

export async function validateRewardEligibility(
  userId: string,
  reward: RewardAggregate,
): Promise<EligibilityResult> {
  if (!userId) {
    return { eligible: false, reason: "Authentication required" };
  }

  if (!reward.reward_active) {
    return { eligible: false, reason: "Reward Inactive" };
  }

  if (reward.stock <= 0 && reward.available <= 0) {
    return { eligible: false, reason: "Reward Sold Out" };
  }

  if (reward.expired_at && new Date(reward.expired_at) < new Date()) {
    return { eligible: false, reason: "Reward Expired" };
  }

  if (reward.campaign_slug) {
    try {
      const campaign = await getCampaignBySlug(reward.campaign_slug);
      if (campaign) {
        const status = deriveCampaignStatus(campaign);
        if (!isCampaignVisible(status)) {
          return { eligible: false, reason: "Campaign Closed" };
        }
      }
    } catch {
      return { eligible: false, reason: "Campaign Unavailable" };
    }
  }

  let canonical;
  try {
    canonical = await getCanonicalUser(userId);
  } catch {
    return { eligible: false, reason: "Wallet Unavailable" };
  }

  if (canonical.current_vxp < reward.cost) {
    return { eligible: false, reason: "Insufficient VXP" };
  }
  if (reward.vip_only && canonical.role === "member") {
    return { eligible: false, reason: "VIP Only" };
  }

  if (reward.required_badge) {
    const badges = canonical.badges;
    const hasBadge = badges.some(
      (b) => b.badge_key === reward.required_badge || b.badge_name === reward.required_badge,
    );
    if (!hasBadge) {
      return { eligible: false, reason: "Badge Required" };
    }
  }

  if (reward.required_achievement) {
    try {
      const achievements = await getEarnedAchievements(userId);
      const hasAchievement = achievements.some((a) => {
        return String(a.achievement_id) === reward.required_achievement;
      });
      if (!hasAchievement) {
        return { eligible: false, reason: "Achievement Required" };
      }
    } catch {
      return { eligible: false, reason: "Achievement Check Failed" };
    }
  }

  return { eligible: true, reason: "" };
}
