export interface MissionConfig {
  id: number

  title: string

  description: string

  type: string

  action: string

  icon: string

  badge?: string

  target: number

  reward: number

  repeat: boolean

  active: boolean

  listenMode: string

  repeatable: boolean

  continuous: boolean

  accumulative: boolean

  daily: boolean

  durationMinutes?: number

  start?: string

  end?: string

  sort: number
}

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

    mission_sort?: number

    action?: string

    target?: number

    reward?: number

    repeat?: boolean

    active?: boolean

    type?: string

    listen_mode?: string
  }
}

export interface MissionProgress {
  mission_id: number

  progress: number

  completed: boolean

  claimed: boolean

  updated_at?: string
}

export interface MissionEngineInput {
  userId: string

  missionId: number

  amount?: number

  action?: string
}