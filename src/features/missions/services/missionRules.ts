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

export function isMonthlyMission(mission: MissionConfig) {
  return mission.type === 'monthly'
}

export function isOneTimeMission(mission: MissionConfig) {
  return mission.type === 'once' || mission.type === 'one-time'
}

export function isListenMission(mission: MissionConfig) {
  return mission.action === 'listen'
}

export function isReferralMission(mission: MissionConfig) {
  return mission.action === 'referral'
}

export function isSocialMission(mission: MissionConfig) {
  return mission.action === 'social'
}

export function isShareMission(mission: MissionConfig) {
  return mission.action === 'share'
}

export function isEventMission(mission: MissionConfig) {
  return mission.action === 'event'
}

export function isSurveyMission(mission: MissionConfig) {
  return mission.action === 'survey'
}

export function isPurchaseMission(mission: MissionConfig) {
  return mission.action === 'purchase'
}

export function isExternalMission(mission: MissionConfig) {
  return mission.action === 'external'
}

export function isCheckinMission(mission: MissionConfig) {
  return mission.action === 'checkin'
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

  const today = new Date().toISOString().split('T')[0]
  const completed = new Date(progress.completed_at).toISOString().split('T')[0]

  return today !== completed
}

export function shouldResetOnMonthlyBoundary(
  mission: MissionConfig,
  progress: MissionProgressRecord | null
) {
  if (!isMonthlyMission(mission) || !progress?.completed_at) {
    return false
  }

  const now = new Date()

  const completed = new Date(progress.completed_at)

  return (
    now.getFullYear() !== completed.getFullYear() ||
    now.getMonth() !== completed.getMonth()
  )
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

export function shouldDailyReset(lastReset: string) {
  return lastReset !== new Date().toISOString().split('T')[0]
}