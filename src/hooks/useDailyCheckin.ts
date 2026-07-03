import { useCallback, useEffect } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { useMissions } from './useMissions'
import { supabase } from '@/lib/supabase'
import type { MissionConfig } from '@/features/missions/services/missionTypes'

export function useDailyCheckin() {
  const { user } = useAuth()
  const { data: missions } = useMissions()

  const runCheckin = useCallback(async (missionId: number) => {
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
  }, [user])

  useEffect(() => {
    if (!user) return
    if (!missions?.length) return

    const checkinMission = missions.find(
      (m: MissionConfig) =>
        m.action === 'checkin'
    )

    if (!checkinMission) return

    void runCheckin(checkinMission.id)
  }, [missions, runCheckin, user])
}