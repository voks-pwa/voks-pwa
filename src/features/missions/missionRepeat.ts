import { getMissionProgress } from "./missionProgress";
import { resetMissionProgress } from "./missionProgress";
import type { MissionConfig } from "./missionTypes";

export async function repeatMissionIfNeeded(
  userId: string,
  mission: MissionConfig
) {
  if (!mission.repeat) {
    return;
  }

  const progress = await getMissionProgress(
    userId,
    mission.id
  );

  if (!progress) {
    return;
  }

  if (!progress.completed) {
    return;
  }

  if (!progress.claimed) {
    return;
  }

  console.log(
    "REPEAT MISSION RESET",
    mission.title
  );

  await resetMissionProgress(
    userId,
    mission
  );
}