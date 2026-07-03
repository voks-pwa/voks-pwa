import { missionEngine } from '@/features/missions'
import type { MissionEngineInput } from '@/features/missions/services/missionTypes'

export async function trackMission(args: MissionEngineInput) {
  return missionEngine(args)
}