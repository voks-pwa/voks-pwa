import { getCanonicalUser } from "@/features/profile/services/userCanonicalService";
import { getMilestones, grantMilestone } from "../repositories/milestoneRepository";
import { MILESTONE_CATALOG, type MilestoneDefinition } from "./milestoneCatalog";
import { grantReward } from "@/core/reward-engine";
import { track } from "@/core/action-engine/engine";
import { calculateXP } from "@/features/economy/services/economyEngine";
import { getClaimedMissionCount, getReferralCount, getProgressForMission, getShareCount } from "../repositories/metricsRepository";

async function readMilestoneMetric(
  metric: MilestoneDefinition["metric"],
  userId: string,
): Promise<number> {
  switch (metric) {
    case "xp": {
      const canonical = await getCanonicalUser(userId);
      return canonical.lifetime_vxp;
    }
    case "missions": {
      return getClaimedMissionCount(userId);
    }
    case "referrals": {
      return getReferralCount(userId);
    }
    case "listening_hours": {
      const seconds = await getProgressForMission(userId, listenMissionId());
      return Math.floor(seconds / 3600);
    }
    case "shares": {
      return getShareCount(userId);
    }
    case "profile": {
      const canonical = await getCanonicalUser(userId);
      return canonical.profile_completed ? 1 : 0;
    }
    default:
      return 0;
  }
}

let cachedListenMissionId: number | null = null;
export function setListenMissionId(id: number) {
  cachedListenMissionId = id;
}
function listenMissionId(): number {
  return cachedListenMissionId ?? -1;
}

export async function evaluateMilestones(userId: string): Promise<void> {
  const earned = await getMilestones(userId);
  const earnedKeys = new Set(earned.map((e) => e.milestone_key));

  for (const def of MILESTONE_CATALOG) {
    if (earnedKeys.has(def.key)) continue;

    const value = await readMilestoneMetric(def.metric, userId);
    if (value < def.threshold) continue;

    const calc = await calculateXP({
      source: `MILESTONE_${def.key}`,
      userId,
      context: { metric: def.metric, threshold: def.threshold },
    });
    const amount = calc.finalXP;

    const guard = await grantReward({
      userId,
      source: "milestone",
      referenceId: def.key,
      amount,
      reason: `Milestone: ${def.name}`,
    });

    if (guard.skipped) continue;

    await grantMilestone(userId, {
      milestone_key: def.key,
      milestone_name: def.name,
      metric: def.metric,
      threshold_value: def.threshold,
      reward_vxp: amount,
    });

    track("MILESTONE_UNLOCK", userId, {
      key: def.key,
      name: def.name,
      reward_vxp: amount,
    });
  }
}
