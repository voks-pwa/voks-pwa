import { useEffect } from 'react'

import {
  emitMissionEvent,
} from './missionEventBus'

import {
  startListening,
  stopListening,
  interruptListening,
  addListeningSecond,
} from './missionRuntime'

export function useListenMission(
  userId?: string,
  isPlaying?: boolean
) {

  /*
   * PLAY / PAUSE
   */

  useEffect(() => {

    if (!userId) return

    if (isPlaying) {

      startListening(userId)

      emitMissionEvent({

        userId,

        action: 'listen_tick',

      })

    } else {

      interruptListening(userId)

      emitMissionEvent({

        userId,

        action: 'listen_pause',

      })

    }

  }, [userId, isPlaying])

  /*
   * LISTEN TICK
   */

  useEffect(() => {

    if (!userId) return

    if (!isPlaying) return

    const timer = window.setInterval(() => {

      addListeningSecond(userId)

      emitMissionEvent({

        userId,

        action: 'listen_tick',

        amount: 1,

      })

    }, 1000)

    return () => {

      clearInterval(timer)

    }

  }, [userId, isPlaying])

  /*
   * TAB CLOSED
   */

  useEffect(() => {

    if (!userId) return

    const handleUnload = () => {

      stopListening(userId)

      emitMissionEvent({

        userId,

        action: 'listen_stop',

      })

    }

    window.addEventListener(
      'beforeunload',
      handleUnload
    )

    return () => {

      window.removeEventListener(
        'beforeunload',
        handleUnload
      )

    }

  }, [userId])

}