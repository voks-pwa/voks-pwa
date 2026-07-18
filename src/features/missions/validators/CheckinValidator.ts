import { supabase } from "@/lib/supabase";
import type { MissionValidator, ValidatorInput, ValidatorResult } from "./types";

export const checkinValidator: MissionValidator = {
  type: "checkin",

  async validate(input: ValidatorInput): Promise<ValidatorResult> {
    const today = new Date().toISOString().split("T")[0];

    const { count } = await supabase
      .from("missions_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", input.userId)
      .eq("mission_id", input.mission.id)
      .gte("claimed_at", today);

    const complete = (count ?? 0) === 0;
    return { complete, score: complete ? 1 : 0, maxScore: 1 };
  },
};
