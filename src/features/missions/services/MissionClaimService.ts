import { supabase } from "@/lib/supabase";

export async function processMissionClaim(
  userId: string,
  missionId: number,
) {
  const { data } = await supabase
    .from("missions_progress")
    .select("claimed")
    .eq("user_id", userId)
    .eq("mission_id", missionId)
    .maybeSingle();

  if (data?.claimed) {
    return {
      success: false,
      claimed: true,
      message: "Reward already claimed",
    };
  }

  const { error } = await supabase
    .from("missions_progress")
    .update({
      claimed: true,
    })
    .eq("user_id", userId)
    .eq("mission_id", missionId);

  if (error) {
    return {
      success: false,
      claimed: false,
      message: error.message,
    };
  }

  return {
    success: true,
    claimed: true,
    message: "Mission claimed",
  };
}