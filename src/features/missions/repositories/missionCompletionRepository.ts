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

export interface MissionCompletionRow {
  id: number;
  user_id: string;
  mission_id: number;
  reward_vxp: number;
  completed_at: string;
}

export async function getUserMissionCompletions(
  userId: string,
): Promise<MissionCompletionRow[]> {
  const { data, error } =
    await supabase
      .from("mission_completions")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

  if (error) {
    console.error("GET MISSION COMPLETIONS ERROR", error);
    return [];
  }

  return (data as MissionCompletionRow[]) ?? [];
}