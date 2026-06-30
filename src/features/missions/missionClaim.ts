import { supabase } from '@/lib/supabase'
import { useMissionStore } from "./missionStore"


export async function isMissionClaimed(
  userId: string,
  missionId: number
) {
  const { data } =
    await supabase
      .from('missions_progress')
      .select('claimed')
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .maybeSingle()

  return data?.claimed ?? false
}

export async function claimMissionReward(
  userId: string,
  missionId: number
) {
  const { error } =
    await supabase
      .from('missions_progress')
      .update({
        claimed: true,
      })
      .eq('user_id', userId)
      .eq('mission_id', missionId)

  if (error) {
    console.error(
      'CLAIM ERROR',
      error
    )
  }

  useMissionStore
.getState()
.claimReward(
    missionId
)
}