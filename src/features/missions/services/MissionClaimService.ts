import { supabase } from "@/lib/supabase";
import type { MissionConfig } from "../types/mission";
import { isAutoClaimMission } from "../validators";
import { getMissionProgress } from "../repositories/missionProgressRepository";
import { grantReward } from "@/core/reward-engine";
import { calculateXP } from "@/features/economy/services/economyEngine";
import type { XpSource } from "@/features/economy/types";

function missionSource(mission: MissionConfig): XpSource {
  if (mission.period === "daily") return "MISSION_DAILY";
  if (mission.period === "weekly") return "MISSION_WEEKLY";
  if (mission.period === "monthly") return "MISSION_MONTHLY";
  return "MISSION_COMPLETE";
}

export async function processMissionClaim(userId: string, mission: MissionConfig) {
  if (!userId) {
    return { success: false, claimed: false, message: "Authentication required" };
  }

  const calc = await calculateXP({
    source: missionSource(mission),
    userId,
    context: { mission_id: mission.id, period: mission.period },
  });
  const amount = calc.finalXP;

  const guard = await grantReward({
    userId,
    source: "mission",
    referenceId: String(mission.id),
    amount,
    reason: `Mission: ${mission.title}`,
  });

  if (guard.skipped) {
    return { success: false, claimed: false, message: "Reward already claimed" };
  }

  const { data, error } = await supabase.rpc("claim_mission_reward", {
    p_user_id: userId,
    p_mission_id: mission.id,
    p_reward_vxp: amount,
    p_period: mission.period,
  });

  if (error) {
    console.error(`[CLAIM] rpc error user=${userId} mission=${mission.id}: ${error.message}`);
    return { success: false, claimed: false, message: error.message };
  }

  const result = data as { success: boolean; error?: string; reward?: number; current_vxp?: number };

  if (!result.success) {
    console.warn(`[CLAIM] rejected user=${userId} mission=${mission.id}: ${result.error ?? "Claim failed"}`);
    return { success: false, claimed: false, message: result.error ?? "Claim failed" };
  }

  if (mission.action === "referral") {
    await markReferralsGranted(userId);
  }

  return {
    success: true,
    claimed: true,
    reward: result.reward ?? amount,
    currentVxp: result.current_vxp,
    message: "Reward claimed",
  };
}

export async function autoClaimIfEligible(userId: string, mission: MissionConfig) {
  if (!isAutoClaimMission(mission)) return null;

  const existing = await getMissionProgress(userId, mission.id);
  if (existing?.claimed) return null;

  return processMissionClaim(userId, mission);
}

async function markReferralsGranted(userId: string) {
  const { error } = await supabase
    .from("referrals")
    .update({ reward_granted: true })
    .eq("referrer_id", userId)
    .eq("reward_granted", false);

  if (error) {
    console.error(`[CLAIM] failed to mark referrals reward_granted user=${userId}: ${error.message}`);
  }
}
