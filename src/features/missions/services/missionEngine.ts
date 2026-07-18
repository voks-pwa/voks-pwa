import { getMission } from "./missionWP";
import type { MissionEngineInput } from "./missionTypes";
import { useMissionStore } from "./missionStore";
import {
  canRepeatMission,
  isContinuousMission,
  isAccumulativeMission,
  isDailyMission,
} from "./missionRules";
import { getRuntime, updateResetDate } from "./missionRuntime";
import { processMissionProgress, processDailyReset } from "./missionProgressService";
import { autoClaimIfEligible } from "./MissionClaimService";
import { repeatMissionIfNeeded } from "./missionRepeat";
import { track } from "@/core/action-engine/engine";

export async function missionEngine({
  userId,
  missionId,
  amount = 1,
  action,
}: MissionEngineInput) {
  if (!userId) {
    return { success: false, completed: false, progress: 0, reward: 0, claimed: false, missionId: missionId ?? 0, missionTitle: "", message: "Authentication required", blocked: true };
  }

  if (!missionId) {
    return { success: false, completed: false, progress: 0, reward: 0, claimed: false, missionId: 0, missionTitle: "", message: "Mission id required", blocked: true };
  }

  const mission = await getMission(missionId);

  if (!mission) {
    return { success: false, completed: false, progress: 0, reward: 0, claimed: false, missionId, missionTitle: "", message: "Mission not found", blocked: true };
  }

  if (action === "scheduler_tick" && isDailyMission(mission)) {
    const runtime = getRuntime(userId);
    const today = new Date().toISOString().split("T")[0];

    if (runtime.lastResetDate !== today) {
      await processDailyReset(userId, mission);
      updateResetDate(userId);
    }

    return { success: true, completed: false, progress: 0, reward: 0, claimed: false, missionId: mission.id, missionTitle: mission.title, message: "Daily Reset", blocked: false };
  }

  const repeatable = canRepeatMission(mission);
  const continuous = isContinuousMission(mission);
  const accumulative = isAccumulativeMission(mission);
  const daily = isDailyMission(mission);

  const progress = await processMissionProgress(userId, mission, amount, action);

  let claimResult = { success: true, claimed: false, reward: 0, message: "" };

  if (progress.justCompleted) {
    const autoResult = await autoClaimIfEligible(userId, mission);

    if (autoResult) {
      claimResult = { ...autoResult, reward: autoResult.reward ?? mission.reward };
      await repeatMissionIfNeeded(userId, mission);
    }
  }

  if (claimResult.reward > 0) {
    track("MISSION_COMPLETE", userId, {
      mission_id: mission.id,
      reward_vxp: claimResult.reward,
    });
  }

  useMissionStore.getState().setProgress({
    missionId: mission.id,
    progress: progress.progress ?? 0,
    target: mission.durationMinutes ? mission.durationMinutes * 60 : mission.target,
    completed: Boolean(progress.completed),
    claimed: claimResult.claimed,
    reward: claimResult.reward,
  });

  return {
    success: true,
    completed: Boolean(progress.completed),
    progress: progress.progress ?? 0,
    reward: claimResult.reward,
    claimed: claimResult.claimed,
    missionId: mission.id,
    missionTitle: mission.title,
    message: claimResult.message || progress.message,
    blocked: Boolean(progress.blocked),
    repeatable,
    continuous,
    accumulative,
    daily,
  };
}
