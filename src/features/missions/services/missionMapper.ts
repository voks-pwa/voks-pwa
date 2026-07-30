import type { MissionConfig } from "../types/mission";
import type { WPMission } from "./missionTypes";

export function mapMission(wp: WPMission): MissionConfig {
  return {
    id: wp.id,
    title: wp.title?.rendered ?? "",
    description: wp.acf?.mission_description ?? "",
    type: wp.acf?.mission_type ?? "mission",
    icon: wp.acf?.mission_icon ?? "trophy",
    badge: wp.acf?.mission_badge,
    target: Number(wp.acf?.mission_target ?? 1),
    reward: Number(wp.acf?.mission_vxp ?? 0),
    action: wp.acf?.mission_action ?? wp.acf?.action ?? "",
    repeat: Boolean(wp.acf?.mission_repeat ?? wp.acf?.repeat),
    active: Boolean(wp.acf?.mission_active ?? wp.acf?.active),
    listenMode: wp.acf?.mission_listen_mode ?? wp.acf?.listen_mode ?? "",
    repeatable: Boolean(wp.acf?.repeatable),
    continuous: Boolean(wp.acf?.continuous),
    accumulative: Boolean(wp.acf?.accumulative),
    daily: Boolean(wp.acf?.daily),
    period: wp.acf?.period ?? "once",
    durationMinutes: wp.acf?.duration_minutes != null ? Number(wp.acf.duration_minutes) : undefined,
    dateStart: wp.acf?.mission_start ?? "",
    dateEnd: wp.acf?.mission_end ?? "",
    timeStart: wp.acf?.mission_time_start ?? "",
    timeEnd: wp.acf?.mission_time_end ?? "",
    sort: Number(wp.acf?.mission_sort ?? 0),
    campaignSlug: wp.acf?.mission_campaign_slug || undefined,
  };
}
