import { getCanonicalUser } from "@/features/profile/services/userCanonicalService";
import { getMilestones, grantMilestone } from "../repositories/milestoneRepository";
import { MILESTONE_CATALOG, type MilestoneDefinition } from "./milestoneCatalog";
import { grantReward } from "@/core/reward-engine";
import { track } from "@/core/action-engine/engine";
import { calculateXP } from "@/features/economy/services/economyEngine";
import { supabase } from "@/lib/supabase";

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
      const { count } = await supabase
        .from("missions_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("claimed", true);
      return count ?? 0;
    }
    case "referrals": {
      const { count } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", userId)
        .eq("reward_granted", true);
      return count ?? 0;
    }
    case "listening_hours": {
      const { data } = await supabase
        .from("missions_progress")
        .select("progress")
        .eq("user_id", userId)
        .eq("mission_id", listenMissionId())
        .maybeSingle();
      return Math.floor((data?.progress ?? 0) / 3600);
    }
    case "shares": {
      const { count } = await supabase
        .from("activity_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("activity_type", "share");
      return count ?? 0;
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
