import { supabase } from "@/lib/supabase";
import type { MissionValidator, ValidatorInput, ValidatorResult } from "./types";

export const shareValidator: MissionValidator = {
  type: "share",

  async validate(input: ValidatorInput): Promise<ValidatorResult> {
    const { count } = await supabase
      .from("activity_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", input.userId)
      .eq("activity_type", "share")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const score = count ?? 0;
    return { complete: score >= input.mission.target, score, maxScore: input.mission.target };
  },
};
