import type { MissionConfig } from "../types/mission";

export interface ValidatorInput {
  userId: string;
  mission: MissionConfig;
}

export interface ValidatorResult {
  complete: boolean;
  score: number;
  maxScore: number;
}

export interface MissionValidator {
  type: string;
  validate(input: ValidatorInput): Promise<ValidatorResult>;
}
