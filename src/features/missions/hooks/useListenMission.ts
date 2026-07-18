import { useEffect } from 'react'

import {
  track,
} from '@/core/action-engine'

import {
  finishListeningSession,
  startListening,
  addListeningSecond,
} from '../services/missionRuntime'

export function useListenMission(
  userId?: string,
  isPlaying?: boolean
) {

  useEffect(() => {

    if (!userId) return

    if (isPlaying) {

      startListening(userId)

    }

  }, [userId, isPlaying])

  useEffect(() => {

    if (!userId) return

    if (!isPlaying) return

    const timer = window.setInterval(() => {

      addListeningSecond(userId)
      track("LISTEN_TICK", userId, { seconds: 1 }, 1)

    }, 1000)

    return () => {

      clearInterval(timer)

    }

  }, [userId, isPlaying])

  useEffect(() => {

    if (!userId) return

    const handleStop = () => {
      finishListeningSession(userId)
    }

    window.addEventListener(
      'beforeunload',
      handleStop
    )

    return () => {

      window.removeEventListener(
        'beforeunload',
        handleStop
      )

    }

  }, [userId])

}
