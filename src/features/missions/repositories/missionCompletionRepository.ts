import { supabase } from "@/lib/supabase";

export async function insertMissionCompletion(
  userId: string,
  missionId: number,
  reward: number,
) {
  const { error } =
    await supabase
      .from("mission_completions")
      .insert({
        user_id: userId,
        mission_id: missionId,
        reward_vxp: reward,
      });

  if (error) throw error;
}

export async function getMissionCompletion(
  userId: string,
  missionId: number,
) {
  const { data, error } =
    await supabase
      .from("mission_completions")
      .select("*")
      .eq("user_id", userId)
      .eq("mission_id", missionId);

  if (error) throw error;

  return data;
}