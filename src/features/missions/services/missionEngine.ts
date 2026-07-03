import { getMission } from "./missionWP";
import type { MissionEngineInput } from "./missionTypes";

import { useMissionStore } from "./missionStore";

import {
  canRepeatMission,
  isContinuousMission,
  isAccumulativeMission,
  isDailyMission,
} from "./missionRules";

import {
  getRuntime,
  updateResetDate,
} from "./missionRuntime";

import {
  processMissionProgress,
  processDailyReset,
} from "./missionProgressService";

import { processMissionReward } from "./MissionRewardService";

import { processMissionClaim } from "./MissionClaimService";

import { repeatMissionIfNeeded } from "./missionRepeat";

import { useNotificationStore } from "@/features/notifications/notificationStore";

import { pushMissionNotification } from "@/features/notifications/missionNotification";

export async function missionEngine({
  userId,
  missionId,
  amount = 1,
  action,
}: MissionEngineInput) {
  console.log("MISSION ENGINE START", {
    userId,
    missionId,
    amount,
    action,
  });

  if (!missionId) {
    return {
      success: false,
      completed: false,
      progress: 0,
      reward: 0,
      claimed: false,
      missionId: 0,
      missionTitle: "",
      message: "Mission id required",
      blocked: true,
    };
  }

  const mission = await getMission(missionId);

  if (!mission) {
    return {
      success: false,
      completed: false,
      progress: 0,
      reward: 0,
      claimed: false,
      missionId,
      missionTitle: "",
      message: "Mission not found",
      blocked: true,
    };
  }

  /**
   * DAILY RESET
   */

  if (
    action === "scheduler_tick" &&
    isDailyMission(mission)
  ) {
    const runtime = getRuntime(userId);

    const today = new Date().toDateString();

    if (runtime.lastResetDate !== today) {
      await processDailyReset(
        userId,
        mission,
      );

      updateResetDate(userId);

      console.log(
        "MISSION DAILY RESET",
        mission.title,
      );
    }

    return {
      success: true,
      completed: false,
      progress: 0,
      reward: 0,
      claimed: false,
      missionId: mission.id,
      missionTitle: mission.title,
      message: "Daily Reset",
      blocked: false,
    };
  }

  /**
   * RULE FLAGS
   */

  const repeatable = canRepeatMission(mission);
  const continuous = isContinuousMission(mission);
  const accumulative = isAccumulativeMission(mission);
  const daily = isDailyMission(mission);

  /**
   * PROGRESS
   */

  const progress =
    await processMissionProgress(
      userId,
      mission,
      amount,
      action,
    );

  /**
   * DEFAULT RESULT
   */

  let reward = {
    success: true,
    reward: 0,
    message: "",
  };

  let claim = {
    success: true,
    claimed: false,
    message: "",
  };

  /**
   * REWARD
   */

  if (progress.justCompleted) {
    reward =
      await processMissionReward(
        userId,
        mission,
      );

    if (reward.success) {
      claim =
        await processMissionClaim(
          userId,
          mission.id,
        );

      await repeatMissionIfNeeded(
        userId,
        mission,
      );
    }
  }

  /**
   * NOTIFICATION
   */

  if (reward.reward > 0) {
    useNotificationStore
      .getState()
      .addNotification({
        type: "mission",
        title: "Mission Complete",
        message: mission.title,
        reward: reward.reward,
        missionId: mission.id,
      });

    pushMissionNotification({
      missionId: mission.id,
      missionTitle: mission.title,
      reward: reward.reward,
      progress: progress.progress ?? 0,
    });
  }

  /**
   * STORE
   */

  useMissionStore
    .getState()
    .setProgress({
      missionId: mission.id,
      progress: progress.progress ?? 0,
      target:
        mission.durationMinutes
          ? mission.durationMinutes * 60
          : mission.target,
      completed: Boolean(progress.completed),
      claimed: claim.claimed,
      reward: reward.reward,
    });

  /**
   * RESULT
   */

  return {
    success: true,
    completed: Boolean(progress.completed),
    progress: progress.progress ?? 0,
    reward: reward.reward,
    claimed: claim.claimed,
    missionId: mission.id,
    missionTitle: mission.title,
    message:
      reward.message ||
      claim.message ||
      progress.message,
    blocked: Boolean(progress.blocked),

    repeatable,
    continuous,
    accumulative,
    daily,
  };
}