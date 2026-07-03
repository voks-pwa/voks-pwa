import { supabase } from "@/lib/supabase";

export async function getMissionById(
  missionId: number,
) {
  const { data, error } = await supabase
    .from("missions")
    .select("*")
    .eq("id", missionId)
    .single();

  if (error) throw error;

  return data;
}

export async function getAllMissions() {
  const { data, error } = await supabase
    .from("missions")
    .select("*")
    .eq("active", true);

  if (error) throw error;

  return data;
}