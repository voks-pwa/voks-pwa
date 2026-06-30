import { supabase } from '@/lib/supabase'

export async function updateMissionProgress({
  userId,
  missionId,
  progress,
}: {
  userId: string
  missionId: number
  progress: number
}) {
  const { data: existing } =
    await supabase
      .from('missions_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .maybeSingle()

  if (!existing) {
    await supabase
      .from('missions_progress')
      .insert({
        user_id: userId,
        mission_id: missionId,
        progress,
        completed: false,
        claimed: false,
      })

    return
  }

  await supabase
    .from('missions_progress')
    .update({
      progress,
    })
    .eq('id', existing.id)
}