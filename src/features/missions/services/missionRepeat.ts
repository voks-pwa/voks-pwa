
import { resetMissionProgress } from "./missionProgressService";
import type { MissionConfig } from "./missionTypes";

export async function repeatMissionIfNeeded(
  userId: string,
  mission: MissionConfig
) {
  if (!mission.repeat) {
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