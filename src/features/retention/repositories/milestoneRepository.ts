import { supabase } from "@/lib/supabase";
import type { UserMilestone } from "../types";

export async function getMilestones(userId: string): Promise<UserMilestone[]> {
  const { data, error } = await supabase
    .from("user_milestones")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("[MILESTONE] read error", error);
    console.error("[MILESTONE] read error detail", JSON.stringify(error, null, 2));
    return [];
  }

  return (data as UserMilestone[]) ?? [];
}

export async function grantMilestone(
  userId: string,
  milestone: Omit<UserMilestone, "id" | "earned_at" | "user_id">,
): Promise<UserMilestone | null> {
  const { data, error } = await supabase
    .from("user_milestones")
    .upsert(
      {
        user_id: userId,
        milestone_key: milestone.milestone_key,
        milestone_name: milestone.milestone_name,
        metric: milestone.metric,
        threshold_value: milestone.threshold_value,
        reward_vxp: milestone.reward_vxp,
      },
      {
        onConflict: "user_id,milestone_key",
        ignoreDuplicates: true,
      },
    )
    .select()
    .maybeSingle();

  if (error) {
    console.error("[MILESTONE] grant error", error);
    console.error("[MILESTONE] grant error detail", JSON.stringify(error, null, 2));
    return null;
  }

  return data as UserMilestone;
}
