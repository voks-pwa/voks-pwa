import { useEffect } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { useMissions } from './useMissions'
import { supabase } from '@/lib/supabase'

export function useDailyCheckin() {
   console.log(
  'DAILY CHECKIN HOOK RUNNING'
)
  const { user } = useAuth()
  const { data: missions } = useMissions()

  useEffect(() => {
    if (!user) return
    if (!missions?.length) return

    const checkinMission = missions.find(
      (m: any) =>
        m.acf?.mission_action === 'checkin'
    )

    console.log(
  'CHECKIN MISSION FOUND',
  checkinMission
)


    if (!checkinMission) return

    runCheckin(checkinMission.id)
  }, [user, missions])

  async function runCheckin(
    missionId: number
  ) {
    const today =
      new Date()
        .toISOString()
        .split('T')[0]

    const { data: existing } =
      await supabase
        .from('missions_progress')
        .select('*')
        .eq('user_id', user!.id)
        .eq('mission_id', missionId)
        .maybeSingle()

console.log(
  'RUNNING DAILY CHECKIN',
  missionId
)
    if (
      existing?.completed_at &&
      existing.completed_at.startsWith(today)
    ) {
      return
    }

    if (!existing) {
      await supabase
        .from('missions_progress')
        .insert({
          user_id: user!.id,
          mission_id: missionId,
          progress: 1,
          completed: true,
          claimed: false,
          completed_at:
            new Date().toISOString(),
        })

      return
    }

    await supabase
      .from('missions_progress')
      .update({
        progress: 1,
        completed: true,
        claimed: false,
        completed_at:
          new Date().toISOString(),
      })
      .eq('id', existing.id)

    console.log(
      'DAILY CHECKIN COMPLETED'
    )
  }
}