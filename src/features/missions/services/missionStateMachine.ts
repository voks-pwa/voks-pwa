import type { MissionState } from "../types/state";
import type { MissionConfig } from "./missionTypes";
import { isMissionAvailableNow } from "./missionAvailability";

const TRANSITIONS: Record<MissionState, MissionState[]> = {
  NOT_STARTED: ["IN_PROGRESS"],
  IN_PROGRESS: ["READY_TO_CLAIM", "NOT_STARTED"],
  READY_TO_CLAIM: ["CLAIMED", "IN_PROGRESS"],
  CLAIMED: ["HISTORY"],
  HISTORY: ["ARCHIVED"],
  ARCHIVED: [],
};

export function canTransition(from: MissionState, to: MissionState): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function nextState(current: MissionState, target: MissionState): MissionState {
  if (canTransition(current, target)) return target;
  return current;
}

export function deriveMissionState(
  mission: MissionConfig,
  progress: {
    completed?: boolean;
    claimed?: boolean;
    progress?: number;
  } | null,
): MissionState {
  if (!progress) {
    if (!isMissionAvailableNow(mission) || !mission.active) return "NOT_STARTED";
    return "NOT_STARTED";
  }

  if (progress.claimed) return "CLAIMED";
  if (progress.completed) return "READY_TO_CLAIM";
  if (!isMissionAvailableNow(mission) || !mission.active) return "NOT_STARTED";
  if (progress.progress != null && progress.progress > 0) return "IN_PROGRESS";
  return "NOT_STARTED";
}

export function deriveInitialMissionState(): MissionState {
  return "NOT_STARTED";
}
