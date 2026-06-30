import { getMission } from './missionWP'
import { increaseMissionProgress } from './missionProgress'
import { rewardMission } from './missionReward'
import { repeatMissionIfNeeded } from "./missionRepeat";

import type { MissionEngineInput } from './missionTypes'
import { useMissionStore } from "./missionStore"

import {
  canRepeatMission,
  isContinuousMission,
  isAccumulativeMission,
  isDailyMission,
} from './missionRules'

import { getRuntime, updateResetDate } from './missionRuntime'
import { dailyResetMission } from './missionProgress'
import { useNotificationStore } from "../notifications/notificationStore";
import { pushMissionNotification } from "@/features/notifications/missionNotification"

export async function missionEngine({
  userId,
  missionId,
  amount = 1,
  action,
}: MissionEngineInput) {
  console.log('MISSION ENGINE START', {
    userId,
    missionId,
    amount,
    action,
  })

  if (!missionId) {
    return {
      success: false,
      completed: false,
      progress: 0,
      reward: 0,
      missionId: 0,
      missionTitle: '',
      message: 'Mission id required',
      blocked: true,
    }
  }

  const mission = await getMission(missionId)

  if (!mission) {
    console.error('MISSION NOT FOUND', missionId)

    return {
      success: false,
      completed: false,
      progress: 0,
      reward: 0,
      missionId,
      missionTitle: '',
      message: 'Mission not found',
      blocked: true,
    }
  }

  console.log('MISSION FOUND', mission)

  /**
   * DAILY RESET
   */

  if (
    action === 'scheduler_tick' &&
    isDailyMission(mission)
  ) {
    const runtime = getRuntime(userId)

    const today = new Date().toDateString()

    if (runtime.lastResetDate !== today) {
      await dailyResetMission(
        userId,
        mission
      )

      updateResetDate(userId)

      console.log(
        'MISSION DAILY RESET',
        mission.title
      )
    }

    return {
      success: true,
      completed: false,
      progress: 0,
      reward: 0,
      missionId: mission.id,
      missionTitle: mission.title,
      message: 'Daily Reset',
      blocked: false,
    }
  }

  /**
   * RULES
   */

  const repeatable = canRepeatMission(mission)
  const continuous = isContinuousMission(mission)
  const accumulative = isAccumulativeMission(mission)
  const daily = isDailyMission(mission)

  console.table({
    repeatable,
    continuous,
    accumulative,
    daily,
  })

  /**
   * PROGRESS
   */

  const progress = await increaseMissionProgress(
    userId,
    mission,
    amount,
    action
  )

  console.log(
    'MISSION PROGRESS',
    progress
  )

  /**
   * REWARD
   */

  const reward = await rewardMission({
  userId,
  mission,
  justCompleted: Boolean(progress.justCompleted),
});

await repeatMissionIfNeeded(
  userId,
  mission
);
  console.log(
    'MISSION REWARD',
    reward
  )

  if (reward?.reward && reward.reward > 0) {

  useNotificationStore
    .getState()
    .addNotification({

      type: "mission",

      title: "Mission Complete",

      message: mission.title,

      reward: reward.reward,

      missionId: mission.id,

    });

}

  const result = {
    success: true,
    completed: Boolean(progress.completed),
    progress: progress.progress ?? 0,
    reward: reward?.reward ?? 0,
    missionId: mission.id,
    missionTitle: mission.title,
    message:
      reward?.message ??
      progress.message ??
      'Mission processed',
    blocked: Boolean(progress.blocked),

    repeatable,
    continuous,
    accumulative,
    daily,
  }

  console.log(
    'MISSION ENGINE RESULT',
    result
  )

  useMissionStore
.getState()
.setProgress({

    missionId:mission.id,

    progress:result.progress,

    target:
      mission.durationMinutes
        ? mission.durationMinutes*60
        : mission.target,

    completed:result.completed,

    claimed:false,

    reward:result.reward,

})

if (progress.justCompleted) {

  pushMissionNotification({

    missionId: mission.id,

    missionTitle: mission.title,

    reward: reward?.reward ?? 0,

    progress: progress.progress ?? 0,

  })

}
  return result
}