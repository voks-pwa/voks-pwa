import type {
  MissionConfig,
  WPMission,
} from "./missionTypes";

export function mapMission(
  wp: WPMission
): MissionConfig {
  return {
    id: wp.id,

    title:
      wp.title?.rendered ?? "",

    description:
      wp.acf?.mission_description ?? "",

    type:
      wp.acf?.mission_type ?? "mission",

    icon:
      wp.acf?.mission_icon ?? "trophy",

    badge:
      wp.acf?.mission_badge,

    target: Number(
      wp.acf?.mission_target ?? 1
    ),

    reward: Number(
      wp.acf?.mission_vxp ?? 0
    ),

    repeatable: Boolean(
      wp.acf?.repeatable
    ),

    continuous: Boolean(
      wp.acf?.continuous
    ),

    accumulative: Boolean(
      wp.acf?.accumulative
    ),

    daily: Boolean(
      wp.acf?.daily
    ),

    durationMinutes:
      wp.acf?.duration_minutes != null
        ? Number(
            wp.acf.duration_minutes
          )
        : undefined,
  };
}