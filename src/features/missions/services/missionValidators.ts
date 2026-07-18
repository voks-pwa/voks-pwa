import { validateMission, getValidatorForMission } from "../validators";
import type { MissionConfig } from "../types/mission";

export { validateMission, getValidatorForMission };

export async function getValidationProgress(userId: string, mission: MissionConfig): Promise<number> {
  const validator = getValidatorForMission(mission);
  if (!validator) return 0;

  const result = await validator.validate({ userId, mission });
  return result.score;
}
