import { addXP } from '@/features/xp/addXP'

import type { MissionConfig } from './missionTypes'

import {
  isMissionClaimed,
  claimMissionReward,
} from './missionClaim'

export async function rewardMission({
  userId,
  mission,
  justCompleted,
}: {
  userId: string
  mission: MissionConfig
  justCompleted: boolean
}) {
  if (!justCompleted) {
    console.log('MISSION NOT FINISHED', { missionId: mission.id })
    return {
      reward: 0,
      claimed: false,
      success: false,
      message: 'Mission not completed',
    }
  }

  const claimed = await isMissionClaimed(userId, mission.id)

  if (claimed) {
    console.log('MISSION ALREADY CLAIMED', { missionId: mission.id })
    return {
      reward: 0,
      claimed: true,
      success: false,
      message: 'Reward already claimed',
    }
  }

  console.log('MISSION REWARD', {
    missionId: mission.id,
    reward: mission.reward,
  })

  const xpResult = await addXP(userId, mission.reward, mission.action)

  if (!xpResult?.success) {
    console.error('MISSION REWARD FAILED', xpResult)
    return {
      reward: 0,
      claimed: false,
      success: false,
      message: xpResult?.message ?? 'Reward failed',
    }
  }

  await claimMissionReward(userId, mission.id)

  return {
    reward: mission.reward,
    claimed: true,
    success: true,
    message: 'Reward granted',
  }
}