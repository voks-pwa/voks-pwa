import type { ActionEvent } from "@/core/action-engine";
import { evaluateAchievements } from "../services/achievementEngine";
import { evaluateMilestones } from "../services/milestoneEngine";
import { processDailyLoginReward } from "../services/loginRewardEngine";
import { recordDailyActivity } from "../services/streakEngine";

/**
 * Retention Engine — Action Engine consumer.
 *
 * Architecture (AI/15, AI/68):
 *   Mission Engine → Action Engine → Retention Engine →
 *   Achievement Engine → Badge Engine → Reward Engine → History
 *
 * The Action Engine is the ONLY event source. No UI, no React state,
 * no direct profile mutations here.
 */
export async function retentionConsumer(event: ActionEvent): Promise<void> {
  const userId = event.userId;

  switch (event.name) {
    case "USER_LOGIN": {
      await processDailyLoginReward(userId);
      await evaluateAchievements(userId);
      await evaluateMilestones(userId);
      break;
    }

    case "CHECKIN": {
      await recordDailyActivity(userId);
      await evaluateAchievements(userId);
      await evaluateMilestones(userId);
      break;
    }

    case "PROFILE_COMPLETED":
    case "PROFILE_UPDATED": {
      await evaluateAchievements(userId);
      await evaluateMilestones(userId);
      break;
    }

    case "SHARE": {
      await evaluateAchievements(userId);
      await evaluateMilestones(userId);
      break;
    }

    case "REFERRAL_SUCCESS": {
      await evaluateAchievements(userId);
      await evaluateMilestones(userId);
      break;
    }

    case "PLAYER_STOP":
    case "LISTEN_COMPLETED":
    case "LISTEN_TICK": {
      await evaluateAchievements(userId);
      await evaluateMilestones(userId);
      break;
    }

    case "MISSION_COMPLETE": {
      await evaluateAchievements(userId);
      await evaluateMilestones(userId);
      break;
    }

    default:
      break;
  }
}
