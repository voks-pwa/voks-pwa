import type { MissionConfig } from "./missionTypes";

import {
  getMissionProgress,
  createMissionProgress,
  updateMissionProgress,
} from "../repositories/missionProgressRepository";

import {
  canRunMission,
} from "./missionValidator";

import {
  shouldResetOnDailyBoundary,
  shouldUnlockRepeatMission,
} from "./missionRules";

const INTERRUPT_EVENTS = [
  "player_pause",
  "player_stop",
  "player_disconnect",
];

const LISTEN_EVENTS = [
  "player_play",
  "listen_tick",
];

export async function processMissionProgress(
  userId: string,
  mission: MissionConfig,
  amount = 1,
  action = "listen_tick",
): Promise<{
  progress: number;
  completed: boolean;
  justCompleted: boolean;
  blocked: boolean;
  claimed: boolean;
  message: string;
}> {
  const existing =
    await getMissionProgress(
      userId,
      mission.id,
    );

  const allowed =
    canRunMission(
      mission,
      existing,
    );

  if (!allowed) {
    return {
      progress: existing?.progress ?? 0,
      completed: existing?.completed ?? false,
      justCompleted: false,
      blocked: true,
      claimed: existing?.claimed ?? false,
      message: "Mission blocked",
    };
  }

  /**
   * CONTINUOUS LISTENING
   */

  if (mission.listenMode === "continuous") {
    if (
      INTERRUPT_EVENTS.includes(action)
    ) {
      return await resetMissionProgress(
        userId,
        mission,
      );
    }

    if (
      !LISTEN_EVENTS.includes(action)
    ) {
      return {
        progress: existing?.progress ?? 0,
        completed: existing?.completed ?? false,
        justCompleted: false,
        blocked: false,
        claimed: existing?.claimed ?? false,
        message: "Ignored",
      };
    }
  }

  /**
   * DAILY RESET
   */

  if (
    action === "scheduler_tick" &&
    shouldResetOnDailyBoundary(
      mission,
      existing,
    )
  ) {
    return await resetMissionProgress(
      userId,
      mission,
    );
  }

  /**
   * REPEAT RESET
   */

  if (
    action === "scheduler_tick" &&
    shouldUnlockRepeatMission(
      mission,
      existing,
    )
  ) {
    return await resetMissionProgress(
      userId,
      mission,
    );
  }

  const target =
    mission.durationMinutes
      ? mission.durationMinutes * 60
      : mission.target;

  const nextProgress =
    (existing?.progress ?? 0) + amount;

  const completed =
    nextProgress >= target;

  if (!existing) {
    await createMissionProgress(
      userId,
      mission.id,
      nextProgress,
      completed,
    );

    return {
      progress: nextProgress,
      completed,
      justCompleted: completed,
      blocked: false,
      claimed: false,
      message:
        completed
          ? "Mission completed"
          : "Mission started",
    };
  }

  await updateMissionProgress(
    existing.id,
    nextProgress,
    completed,
    completed
      ? new Date().toISOString()
      : null,
    completed
      ? false
      : existing.claimed,
  );

  return {
    progress: nextProgress,
    completed,
    justCompleted:
      completed &&
      !existing.completed,
    blocked: false,
    claimed:
      completed
        ? false
        : existing.claimed ?? false,
    message:
      completed
        ? "Mission completed"
        : "Mission progress updated",
  };
}

export async function resetMissionProgress(
  userId: string,
  mission: MissionConfig,
): Promise<{
  progress: number;
  completed: boolean;
  justCompleted: boolean;
  blocked: boolean;
  claimed: boolean;
  message: string;
}> {
  const existing =
    await getMissionProgress(
      userId,
      mission.id,
    );

  if (!existing) {
    return {
      progress: 0,
      completed: false,
      justCompleted: false,
      blocked: false,
      claimed: false,
      message: "Mission reset",
    };
  }

  await updateMissionProgress(
    existing.id,
    0,
    false,
    null,
    false,
  );

  return {
    progress: 0,
    completed: false,
    justCompleted: false,
    blocked: false,
    claimed: false,
    message: "Mission reset",
  };
}

export async function processDailyReset(
  userId: string,
  mission: MissionConfig,
) {
  return resetMissionProgress(
    userId,
    mission,
  );
}