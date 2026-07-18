import { getMissions } from "@/services/wordpress-api";
import { mapMission } from "@/features/missions/services/missionMapper";
import type { MissionConfig } from "@/features/missions/types/mission";

/**
 * Campaign Mission Loader.
 *
 * The ONLY relationship between Campaign and Mission is `campaign_slug`
 * (Campaign.slug ↔ Mission.campaign_slug). Campaign never owns or computes
 * mission logic — it only groups missions that already belong to the
 * Mission Engine.
 *
 * No ACF relationship, no duplicated mission rules. Mission data and state
 * always come from the Mission Engine.
 */
export async function loadCampaignMissions(
  campaignSlug: string,
): Promise<MissionConfig[]> {
  try {
    const wp = await getMissions();
    return wp
      .map(mapMission)
      .filter(
        (m) => m.active && m.campaignSlug === campaignSlug,
      )
      .sort((a, b) => a.sort - b.sort);
  } catch (error) {
    console.error("[CAMPAIGN] mission load error", error);
    return [];
  }
}

export function getMissionIds(missions: MissionConfig[]): number[] {
  return missions.map((m) => m.id);
}
