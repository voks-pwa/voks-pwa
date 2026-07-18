import { findProfile } from "@/features/profile/services/profileRepository";
import { calculateProfileCompletion } from "@/features/profile/utils/profileCompletion";
import type { MissionValidator, ValidatorInput, ValidatorResult } from "./types";

export const profileValidator: MissionValidator = {
  type: "profile",

  async validate(input: ValidatorInput): Promise<ValidatorResult> {
    const profile = await findProfile(input.userId);

    if (!profile) {
      return { complete: false, score: 0, maxScore: 100 };
    }

    const score = calculateProfileCompletion(profile);
    return { complete: score >= 100, score, maxScore: 100 };
  },
};
