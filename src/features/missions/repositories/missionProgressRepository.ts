import { supabase } from "@/lib/supabase";
import type { MissionProgress } from "../types/progress";

export async function getMissionProgress(userId: string, missionId: number) {
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

  return data as (MissionProgress & { id: number; user_id: string }) | null;
}

export async function createMissionProgress(userId: string, missionId: number, progress: number, completed: boolean) {
  const { data, error } = await supabase
    .from("missions_progress")
    .insert({
      user_id: userId,
      mission_id: missionId,
      progress,
      completed,
      claimed: false,
      mission_state: completed ? "READY_TO_CLAIM" : progress > 0 ? "IN_PROGRESS" : "NOT_STARTED",
      period: "once",
      completed_at: completed ? new Date().toISOString() : null,
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
    if (claimed) {
      updateData.mission_state = "CLAIMED";
      updateData.claimed_at = new Date().toISOString();
    }
  }

  if (completed && !claimed) {
    updateData.mission_state = "READY_TO_CLAIM";
  }

  if (!completed && !claimed) {
    updateData.mission_state = progress > 0 ? "IN_PROGRESS" : "NOT_STARTED";
  }

  updateData.completed_at = completed
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

export async function upsertMissionProgress(
  userId: string,
  missionId: number,
  progress: number,
  completed: boolean,
  claimed: boolean,
) {
  const missionState = claimed ? "CLAIMED" : completed ? "READY_TO_CLAIM" : progress > 0 ? "IN_PROGRESS" : "NOT_STARTED";

  const { data, error } = await supabase
    .from("missions_progress")
    .upsert(
      {
        user_id: userId,
        mission_id: missionId,
        progress,
        completed,
        claimed,
        mission_state: missionState,
        period: "once",
        completed_at: completed ? new Date().toISOString() : null,
        claimed_at: claimed ? new Date().toISOString() : null,
      },
      {
        onConflict: "user_id, mission_id",
        ignoreDuplicates: false,
      },
    )
    .select()
    .single();

  if (error) {
    console.error("UPSERT PROGRESS ERROR", error);
    return null;
  }

  return data;
}
