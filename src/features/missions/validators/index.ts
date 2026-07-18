import type { MissionConfig } from "../types/mission";
import type { MissionValidator, ValidatorInput, ValidatorResult } from "./types";
import { profileValidator } from "./ProfileValidator";
import { checkinValidator } from "./CheckinValidator";
import { listeningValidator } from "./ListeningValidator";
import { referralValidator } from "./ReferralValidator";
import { shareValidator } from "./ShareValidator";

const VALIDATOR_REGISTRY: Record<string, MissionValidator> = {
  profile: profileValidator,
  checkin: checkinValidator,
  listen: listeningValidator,
  referral: referralValidator,
  share: shareValidator,
};

export function getValidatorForMission(mission: MissionConfig): MissionValidator | null {
  return VALIDATOR_REGISTRY[mission.action] ?? null;
}

export async function validateMission(input: ValidatorInput): Promise<ValidatorResult> {
  const validator = getValidatorForMission(input.mission);
  if (!validator) {
    return { complete: false, score: 0, maxScore: input.mission.target };
  }
  return validator.validate(input);
}

export function isAutoClaimMission(mission: MissionConfig): boolean {
  return ["profile", "checkin", "share", "referral"].includes(mission.action);
}

export type { MissionValidator, ValidatorInput, ValidatorResult } from "./types";
