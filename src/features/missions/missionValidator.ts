import type {
  MissionConfig,
} from './missionTypes'

type MissionProgressRecord = {
  completed?: boolean
  completed_at?: string | null
}

export function canRunMission(
  mission: MissionConfig,
  progress: MissionProgressRecord | null
) {
  if (!mission.active) {
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

    const today = new Date().toDateString()
    const completed = new Date(progress.completed_at).toDateString()

    return today !== completed
  }

  return true
}