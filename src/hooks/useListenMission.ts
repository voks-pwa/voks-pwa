import { useEffect, useRef } from 'react'
import { usePlayerStore } from '@/stores/player-store'
import { useAuth } from '@/features/auth/useAuth'
import { useMissions } from '@/hooks/useMissions'
import { supabase } from '@/lib/supabase'
import { emitMissionEvent } from '@/features/missions/missionEventBus'

type ListenSessionState = {
  seconds: number
  completed: boolean
  loaded: boolean
  missionId: number | null
  listenMode: string
  userId: string | null
}

const listenSessionState: ListenSessionState = {
  seconds: 0,
  completed: false,
  loaded: false,
  missionId: null,
  listenMode: 'continuous',
  userId: null,
}

function getMissionValue(mission: any, key: string) {
  return mission?.acf?.[key] ?? mission?.[key]
}

export function useListenMission() {
  const { user } = useAuth()

  const playerStatus = usePlayerStore((state) => state.status)

  const { data: missions } = useMissions()
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (!user) return

    const listenMission = missions?.find(
      (m: any) =>
        getMissionValue(m, 'mission_action') === 'listen' ||
        m?.action === 'listen'
    )

    if (!listenMission) return

    const missionId = Number(listenMission.id)
    const listenMode = String(
      getMissionValue(listenMission, 'mission_listen_mode') ??
        getMissionValue(listenMission, 'listenMode') ??
        'continuous'
    ).toLowerCase()

    if (listenSessionState.userId !== user.id || listenSessionState.missionId !== missionId) {
      listenSessionState.userId = user.id
      listenSessionState.missionId = missionId
      listenSessionState.listenMode = listenMode
      listenSessionState.seconds = 0
      listenSessionState.completed = false
      listenSessionState.loaded = false
    }

    listenSessionState.listenMode = listenMode

    if (!listenSessionState.loaded) {
      const loadProgress = async () => {
        const { data } = await supabase
          .from('missions_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('mission_id', missionId)
          .maybeSingle()

        if (data) {
          const persistedSeconds = Number(data.progress ?? 0)
          listenSessionState.seconds = persistedSeconds
          console.log('LISTEN PROGRESS LOADED', { missionId, persistedSeconds })
        }

        listenSessionState.loaded = true
      }

      void loadProgress()
    }

    const targetMinutes = Number(
      getMissionValue(listenMission, 'mission_duration_minutes') ?? 10
    )
    const targetSeconds = targetMinutes * 60

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (playerStatus !== 'playing') {
      console.log('LISTEN PAUSE', {
        missionId,
        mode: listenMode,
        seconds: listenSessionState.seconds,
      })
      return
    }

    console.log('LISTEN START', {
      missionId,
      mode: listenMode,
      seconds: listenSessionState.seconds,
    })
    console.log(listenMode === 'accumulative' ? 'MISSION ACCUMULATIVE' : 'MISSION CONTINUOUS', {
      missionId,
      mode: listenMode,
    })

    intervalRef.current = window.setInterval(async () => {
      const nextSeconds = listenSessionState.seconds + 1
      listenSessionState.seconds = nextSeconds

      emitMissionEvent({
        action: 'listen_tick',
        userId: user.id,
        amount: 1,
        payload: {
          missionId,
          listenMode,
          seconds: nextSeconds,
          targetSeconds,
        },
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      if (listenMode === 'continuous') {
        console.log('LISTEN STOP', { missionId, seconds: listenSessionState.seconds })
      } else {
        console.log('LISTEN PAUSE', { missionId, seconds: listenSessionState.seconds })
      }
    }
  }, [user, missions, playerStatus])

  useEffect(() => {
    const listenMission = missions?.find(
      (m: any) =>
        getMissionValue(m, 'mission_action') === 'listen' ||
        m?.action === 'listen'
    )

    if (!listenMission) return

    const listenMode = String(
      getMissionValue(listenMission, 'mission_listen_mode') ??
        getMissionValue(listenMission, 'listenMode') ??
        'continuous'
    ).toLowerCase()

    if (listenMode === 'continuous' && playerStatus !== 'playing') {
      console.log('LISTEN RESET', {
        missionId: listenMission.id,
        mode: listenMode,
        seconds: 0,
      })
      listenSessionState.seconds = 0
      listenSessionState.completed = false

      emitMissionEvent({
        action: 'player_pause',
        userId: user?.id ?? '',
        amount: 1,
        payload: {
          missionId: Number(listenMission.id),
          listenMode,
        },
      })
    }
  }, [playerStatus, missions])
}