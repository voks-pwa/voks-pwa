import { useCallback, useEffect } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { useMissions } from './useMissions'
import { track } from '@/core/action-engine'
import type { MissionConfig } from '@/features/missions/services/missionTypes'

export function useDailyCheckin() {
  const { user } = useAuth()
  const { data: missions } = useMissions()

  const runCheckin = useCallback(() => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]

    track("CHECKIN", user.id, { date: today })
  }, [user])

  useEffect(() => {
    if (!user) return
    if (!missions?.length) return

    const checkinMission = missions.find(
      (m: MissionConfig) =>
        m.action === 'checkin'
    )

    if (!checkinMission) return

    runCheckin()
  }, [missions, runCheckin, user])
}