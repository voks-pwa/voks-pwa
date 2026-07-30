export type { MissionConfig } from "../types/mission";

export interface WPMission {
  id: number
  title: {
    rendered: string
  }
  acf: {
    mission_description?: string
    mission_type?: string
    mission_icon?: string
    mission_badge?: string
    mission_target?: number | string
    mission_vxp?: number | string
    repeatable?: boolean
    continuous?: boolean
    accumulative?: boolean
    daily?: boolean
    duration_minutes?: number | string
    mission_action?: string
    mission_repeat?: boolean
    mission_active?: boolean
    mission_listen_mode?: string
    mission_start?: string
    mission_end?: string
    mission_time_start?: string
    mission_time_end?: string
    mission_sort?: number
    mission_campaign_slug?: string
    period?: "daily" | "weekly" | "monthly" | "once"
    action?: string
    target?: number
    reward?: number
    repeat?: boolean
    active?: boolean
    type?: string
    listen_mode?: string
  }
}

export type { MissionProgress } from "../types/progress";

export interface MissionEngineInput {
  userId: string
  missionId: number
  amount?: number
  action?: string
}
