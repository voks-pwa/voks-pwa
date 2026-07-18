import { supabase } from "@/lib/supabase";

export async function getAdminMissionStats() {
  const { data, error } =
    await supabase.functions.invoke(
      "admin-missions"
    );

  if (error) throw error;

  return data.stats ?? {};
}

export interface UpdateMissionPayload {
  missionId: number;
  title: string;
  description: string;
  reward: number;
  target: number;
  active: boolean;
}

export async function updateMission(
  payload: UpdateMissionPayload
) {
  const { data, error } =
    await supabase.functions.invoke(
      "admin-mission-update",
      {
        body: payload,
      }
    );

  if (error) throw error;

  if (!data.success) {
    throw new Error(
      data.error?.message ??
        "Failed to update mission"
    );
  }

  return data.mission;
}