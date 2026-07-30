import type {
  MissionConfig,
} from './missionTypes'

import { isMissionAvailableNow, isMissionInCampaignPeriod } from './missionAvailability'

type MissionProgressRecord = {
  completed?: boolean
  completed_at?: string | null
  claimed?: boolean
}

export function canRunMission(
  mission: MissionConfig,
  progress: MissionProgressRecord | null
) {
  if (!mission.active) {
    return false
  }

  if (!isMissionAvailableNow(mission)) {
    return false
  }

  if (!isMissionInCampaignPeriod(mission)) {
    return false
  }

  if (progress?.claimed) {
    return false
  }

  if (!progress) {
    return true
  }

  if (!mission.repeat && progress.completed) {
    return false
  }

  if (mission.type === 'daily') {
    if (!progress.completed_at) {
      return true
    }

    const today = new Date().toISOString().split('T')[0]
    const completed = new Date(progress.completed_at).toISOString().split('T')[0]

    return today !== completed
  }

  return true
}
