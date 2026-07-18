import { supabase } from "@/lib/supabase";
import type { MissionValidator, ValidatorInput, ValidatorResult } from "./types";

export const referralValidator: MissionValidator = {
  type: "referral",

  async validate(input: ValidatorInput): Promise<ValidatorResult> {
    const { count, error: countError } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", input.userId)
      .eq("reward_granted", false);

    if (countError) {
      return { complete: false, score: 0, maxScore: input.mission.target };
    }

    const score = count ?? 0;
    return { complete: score >= input.mission.target, score, maxScore: input.mission.target };
  },
};
