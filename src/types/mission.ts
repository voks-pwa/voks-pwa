export interface Mission {
  id: number

  title: {
    rendered: string
  }

  acf: {
    mission_type: string

    mission_sort: string

    mission_description: string

    mission_badge: string

    mission_vxp: string

    mission_repeat: boolean

    mission_icon: string

    mission_action: string

    mission_target: string

    mission_active: boolean
  }
}