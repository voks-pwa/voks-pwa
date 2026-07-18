import { supabase } from "@/lib/supabase";
import type { MissionValidator, ValidatorInput, ValidatorResult } from "./types";

export const listeningValidator: MissionValidator = {
  type: "listen",

  async validate(input: ValidatorInput): Promise<ValidatorResult> {
    const { data } = await supabase
      .from("missions_progress")
      .select("progress")
      .eq("user_id", input.userId)
      .eq("mission_id", input.mission.id)
      .maybeSingle();

    const progress = data?.progress ?? 0;
    const target = input.mission.durationMinutes
      ? input.mission.durationMinutes * 60
      : input.mission.target;

    return { complete: progress >= target, score: progress, maxScore: target };
  },
};
