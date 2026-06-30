import { isMissionAvailableNow } from './missionAvailability'
import type { MissionConfig } from './missionTypes'

type MissionProgressRecord = {
  completed?: boolean
  completed_at?: string | null
  claimed?: boolean
}

export function isDailyMission(mission: MissionConfig) {
  return mission.type === 'daily'
}

export function isWeeklyMission(mission: MissionConfig) {
  return mission.type === 'weekly'
}

export function isOneTimeMission(mission: MissionConfig) {
  return mission.type === 'once'
}

export function canRepeatMission(mission: MissionConfig) {
  return mission.repeat === true
}

export function isContinuousMission(mission: MissionConfig) {
  return mission.listenMode === 'continuous'
}

export function isAccumulativeMission(mission: MissionConfig) {
  return mission.listenMode === 'accumulative'
}

export function getMissionMode(mission: MissionConfig) {
  if (isContinuousMission(mission)) {
    return 'continuous'
  }

  if (isAccumulativeMission(mission)) {
    return 'accumulative'
  }

  return 'normal'
}

export function shouldResetProgressOnInterrupt(mission: MissionConfig) {
  return isContinuousMission(mission)
}

export function shouldResetOnDailyBoundary(
  mission: MissionConfig,
  progress: MissionProgressRecord | null
) {
  if (!isDailyMission(mission) || !progress?.completed_at) {
    return false
  }

  return new Date(progress.completed_at).toDateString() !== new Date().toDateString()
}

export function shouldUnlockRepeatMission(
  mission: MissionConfig,
  progress: MissionProgressRecord | null
) {
  return canRepeatMission(mission) && Boolean(progress?.completed)
}

export function shouldProcessScheduledMission(mission: MissionConfig) {
  return isMissionAvailableNow(mission)
}

// 🌟 FUNGSI BARU: Untuk mendeteksi apakah runtime memori perlu di-reset harian
export function shouldDailyReset(lastReset: string) {
  return lastReset !== new Date().toDateString()
}