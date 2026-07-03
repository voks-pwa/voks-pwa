import { supabase } from "@/lib/supabase";

export interface MissionProgressRecord {
  id: number;
  progress?: number;
  completed?: boolean;
  completed_at?: string | null;
  claimed?: boolean;
}

export async function getMissionProgress(
  userId: string,
  missionId: number,
) {
  const { data, error } = await supabase
    .from("missions_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("mission_id", missionId)
    .maybeSingle();

  if (error) {
    console.error("GET PROGRESS ERROR", error);
    return null;
  }

  return data as MissionProgressRecord | null;
}

export async function createMissionProgress(
  userId: string,
  missionId: number,
  progress: number,
  completed: boolean,
) {
  const { data, error } = await supabase
    .from("missions_progress")
    .insert({
      user_id: userId,
      mission_id: missionId,
      progress,
      completed,
      claimed: false,
      completed_at: completed
        ? new Date().toISOString()
        : null,
    })
    .select()
    .single();

  if (error) {
    console.error("CREATE PROGRESS ERROR", error);
    return null;
  }

  return data;
}

export async function updateMissionProgress(
  id: number,
  progress: number,
  completed: boolean,
  completedAt?: string | null,
  claimed?: boolean,
) {
  const updateData: Record<string, unknown> = {
    progress,
    completed,
  };

  if (typeof claimed === "boolean") {
    updateData.claimed = claimed;
  }

  updateData.completed_at =
    completed
      ? completedAt ?? new Date().toISOString()
      : null;

  const { data, error } = await supabase
    .from("missions_progress")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("UPDATE PROGRESS ERROR", error);
    return null;
  }

  return data;
}