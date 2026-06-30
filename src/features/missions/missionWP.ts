import axios from 'axios'

import type {
  MissionConfig,
} from './missionTypes'

interface WPMission {
  id: number
  title?: {
    rendered?: string
  }
  description?: string
  acf?: {
    mission_type?: string
    mission_sort?: number
    mission_description?: string
    mission_badge?: string
    mission_vxp?: number
    mission_repeat?: boolean
    mission_icon?: string
    mission_action?: string
    mission_duration_minutes?: number
    mission_listen_mode?: string
    mission_target?: number
    mission_start?: string
    mission_end?: string
    mission_active?: boolean

    action?: string
    target?: number
    reward?: number
    repeat?: boolean
    active?: boolean
    type?: string
    listen_mode?: string
  }
}

let cache: MissionConfig[] = []

function normalizeMission(
  item: WPMission
): MissionConfig {

  const acf = item.acf ?? {}

  return {

    id: item.id,

    title:
      item.title?.rendered ?? '',

    description:
      acf.mission_description ??
      item.description ??
      '',

    action:
      (
        acf.mission_action ??
        acf.action ??
        ''
      ).trim(),

    target:
      Number(
        acf.mission_target ??
        acf.target ??
        1
      ),

    reward:
      Number(
        acf.mission_vxp ??
        acf.reward ??
        0
      ),

    repeat:
      Boolean(
        acf.mission_repeat ??
        acf.repeat
      ),

    active:
      Boolean(
        acf.mission_active ??
        acf.active
      ),

    type:
      (
        acf.mission_type ??
        acf.type ??
        ''
      ).trim(),

    listenMode:
      (
        acf.mission_listen_mode ??
        acf.listen_mode ??
        ''
      ).trim(),

    durationMinutes:
      Number(
        acf.mission_duration_minutes ??
        0
      ),

    start:
      acf.mission_start ?? '',

    end:
      acf.mission_end ?? '',

     badge:
    acf.mission_badge,

  icon:
    acf.mission_icon,

  sort: Number(
    acf.mission_sort ?? 0
  ),

  }
}

export async function getAllMissions(): Promise<MissionConfig[]> {

  try {

    if (cache.length) {

      return cache

    }

    const response =
      await axios.get<WPMission[]>(
        'https://voksradio.com/wp-json/wp/v2/missions'
      )

    cache =
      response.data.map(
        normalizeMission
      )

    console.log(
      'MISSION CACHE',
      cache
    )

    return cache

  } catch (error) {

    console.error(
      'LOAD MISSION ERROR',
      error
    )

    return []

  }

}

export async function getMission(
  missionId: number
): Promise<MissionConfig | null> {

  const missions =
    await getAllMissions()

  return (
    missions.find(
      m => m.id === missionId
    ) ?? null
  )

}

export async function getMissionByAction(
  action: string
): Promise<MissionConfig[]> {

  const missions =
    await getAllMissions()

  return missions.filter(
    mission =>
      mission.active &&
      mission.action === action
  )

}

export async function reloadMissionCache() {

  cache = []

  return getAllMissions()

}