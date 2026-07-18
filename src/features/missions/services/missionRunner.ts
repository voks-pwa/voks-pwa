import { getAllMissions, getMissionByAction } from './missionWP'
import { missionEngine } from './missionEngine'
import { setMissionResult } from './missionResultStore'
import { isMissionAvailableNow } from './missionAvailability'

export async function runMission({
  userId,
  action,
  amount = 1,
}: {
  userId: string
  action: string
  amount?: number
}) {
  console.log('RUN ACTION', action)

  if (!action) {
    console.error('RUN ACTION MISSING', action)
    return []
  }

  const missionAction =
    [
      'player_play',
      'player_pause',
      'player_stop',
      'player_disconnect',
      'listen_tick',
    ].includes(action)
      ? 'listen'
      : action

  const missions =
    action === 'scheduler_tick'
      ? (await getAllMissions()).filter(isMissionAvailableNow)
      : (await getMissionByAction(missionAction)).filter(isMissionAvailableNow)

  console.log('AVAILABLE MISSIONS', missions)

  if (!missions.length) {
    console.warn('NO MISSION FOUND', action)
    return []
  }

  const results = []

  for (const mission of missions) {
    try {
      const result = await missionEngine({
        userId,
        missionId: mission.id,
        amount,
        action,
      })

      setMissionResult({
        action,
        success: Boolean(result.success),
        completed: Boolean(result.completed),
        progress: result.progress,
        reward: result.reward,
        mission: result.missionTitle,
        message: result.message,
      })

      results.push(result)
    } catch (error) {
      console.error("MISSION ENGINE ERROR", mission.id, error)
      results.push({
        success: false,
        completed: false,
        progress: 0,
        reward: 0,
        claimed: false,
        missionId: mission.id,
        missionTitle: mission.title,
        message: "Engine error",
        blocked: true,
      })
    }
  }

  return results
}