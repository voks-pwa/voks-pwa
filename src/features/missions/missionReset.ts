import { supabase } from '@/lib/supabase'
import { updateMissionProgress } from './missionProgress'
import { isDailyMission } from './missionRules'
import { getMission } from './missionWP'

export async function resetDailyMissions(userId: string) {
  console.log('MISSION DAILY RESET', userId)

  try {
    const { data, error } = await supabase
      .from('missions_progress')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('DAILY RESET ERROR', error)
      return
    }

    for (const progress of data ?? []) {
      const mission = await getMission(progress.mission_id)

      if (mission && isDailyMission(mission)) {
        await updateMissionProgress(progress.id, 0, false, null, progress.claimed)
        console.log('DAILY RESET FOR MISSION', progress.mission_id)
      }
    }
  } catch (error) {
    console.error('DAILY RESET PROCESS ERROR', error)
  }
}