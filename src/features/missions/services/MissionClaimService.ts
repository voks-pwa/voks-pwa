import { supabase } from "@/lib/supabase";
import type { MissionConfig } from "../types/mission";
import { isAutoClaimMission } from "../validators";
import { getMissionProgress } from "../repositories/missionProgressRepository";
import { grantReward } from "@/core/reward-engine";
import { calculateXP } from "@/features/economy/services/economyEngine";
import { syncLevelBadge } from "@/features/profile/services/profileBadgeService";
import { queryClient } from "@/lib/query-client";
import { showToast } from "@/components/ui/showToast";
import type { XpSource } from "@/features/economy/types";

function missionSource(mission: MissionConfig): XpSource {
  if (mission.period === "daily" || mission.type === "daily") return "MISSION_DAILY";
  if (mission.period === "weekly" || mission.type === "weekly") return "MISSION_WEEKLY";
  if (mission.period === "monthly" || mission.type === "monthly") return "MISSION_MONTHLY";
  return "MISSION_COMPLETE";
}

export async function processMissionClaim(userId: string, mission: MissionConfig) {
  if (!userId) {
    return { success: false, claimed: false, message: "Authentication required" };
  }

  const calc = await calculateXP({
    source: missionSource(mission),
    userId,
    baseXP: mission.reward,
    context: { mission_id: mission.id, period: mission.period },
  });
  const amount = calc.finalXP;

  const dateKey = new Date().toISOString().split('T')[0]
  const referenceId = mission.period === "daily" || mission.repeat
    ? `${mission.id}-${dateKey}`
    : String(mission.id)

  // Claim RPC dulu — idempotency asli ada di missions_progress.claimed.
  // reward_grants ditulis SETELAH sukses supaya kegagalan bisa di-retry.
  const { data, error } = await supabase.rpc("claim_mission_reward", {
    p_user_id: userId,
    p_mission_id: mission.id,
    p_reward_vxp: amount,
    p_period: mission.period,
  });

  if (error) {
    console.error(`[CLAIM] rpc error user=${userId} mission=${mission.id}: ${error.message}`);
    showToast({ type: "error", title: "Claim gagal", message: error.message });
    return { success: false, claimed: false, message: error.message };
  }

  const result = data as { success: boolean; error?: string; reward?: number; current_vxp?: number };

  if (!result.success) {
    console.warn(`[CLAIM] rejected user=${userId} mission=${mission.id}: ${result.error ?? "Claim failed"}`);
    return { success: false, claimed: false, message: result.error ?? "Claim failed" };
  }

  await grantReward({
    userId,
    source: "mission",
    referenceId,
    amount,
    reason: `Mission: ${mission.title}`,
  });

  if (mission.action === "referral") {
    await markReferralsGranted(userId);
  }

  await syncLevelBadge(userId);

  queryClient.invalidateQueries({ queryKey: ["profiles", userId] });
  queryClient.invalidateQueries({ queryKey: ["missions-progress", userId] });
  queryClient.invalidateQueries({ queryKey: ["mission-completions", userId] });

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
