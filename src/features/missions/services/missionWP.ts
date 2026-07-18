import axios from 'axios'

import type {
  MissionConfig,
  WPMission,
} from './missionTypes'

import { mapMission } from './missionMapper'

const WP_API_URL =
  import.meta.env.VITE_WP_API_URL ??
  'https://voksradio.com/wp-json/wp/v2'

let cache: MissionConfig[] = []

export async function getAllMissions(): Promise<MissionConfig[]> {

  try {

    if (cache.length) {

      return cache

    }

    const response =
      await axios.get<WPMission[]>(
        `${WP_API_URL}/missions`
      )

    cache =
      response.data.map(
        mapMission
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