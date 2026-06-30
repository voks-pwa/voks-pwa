export interface MissionConfig {
  id: number

  title: string

  description: string

  type: string

  icon: string

  badge?: string

  target: number

  reward: number

  repeatable: boolean

  continuous: boolean

  accumulative: boolean

  daily: boolean

  durationMinutes?: number
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

  action: string
}