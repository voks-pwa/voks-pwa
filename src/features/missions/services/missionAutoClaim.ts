import { getAllMissions } from "./missionWP";
import { processMissionClaim } from "./MissionClaimService";

export async function autoClaimProfileMission(userId: string) {
  const missions = await getAllMissions();
  const profileMission = missions.find((m) => m.action === "profile");

  if (!profileMission) return;

  const existing = await findExistingProgress(userId, profileMission.id);
  if (existing?.claimed) return;

  try {
    await processMissionClaim(userId, profileMission);
  } catch (error) {
    console.error("Auto-claim profile mission failed:", error);
  }
}

async function findExistingProgress(userId: string, missionId: number) {
  const { supabase } = await import("@/lib/supabase");
  const { data } = await supabase
    .from("missions_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("mission_id", missionId)
    .maybeSingle();
  return data;
}
