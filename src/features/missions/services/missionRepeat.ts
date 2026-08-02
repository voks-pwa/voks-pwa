
import { resetMissionProgress } from "./missionProgressService";
import type { MissionConfig } from "./missionTypes";
import { isDailyMission } from "./missionRules";

export async function repeatMissionIfNeeded(
  userId: string,
  mission: MissionConfig
) {
  if (!mission.repeat || isDailyMission(mission)) {
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