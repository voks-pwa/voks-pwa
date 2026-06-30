import {
  useEffect,
  useState,
} from 'react'

import type {
  User,
} from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'

import { createProfile } from './createProfile'
import { AuthContext } from './AuthContext'

import { trackMission } from '@/hooks/useMissionTracker'

import {
  useMissionEventBus,
} from '@/features/missions/useMissionEventBus'

import {
  startMissionScheduler,
  stopMissionScheduler,
} from '@/features/missions/missionScheduler'

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {

  const [user, setUser] =
    useState<User | null>(null)

  const [loading, setLoading] =
    useState(true)

  /**
   * Mission Event Bus
   */
  useMissionEventBus()

  /**
   * First login tracker
   */
  useEffect(() => {

    if (!user) return

    trackMission({
      userId: user.id,
      missionId: 12341,
      amount: 1,
    })

  }, [user])

  /**
   * Scheduler
   */
  useEffect(() => {

    if (!user) {

      stopMissionScheduler()

      return

    }

    startMissionScheduler(user.id)

    return () => {

      stopMissionScheduler()

    }

  }, [user])

  /**
   * Session
   */
  useEffect(() => {

    async function loadSession() {

      const {
        data: {
          session,
        },
      } =
        await supabase.auth.getSession()

      if (session?.user) {

        const { data } =
          await supabase
            .from('profiles')
            .select('id')
            .eq(
              'id',
              session.user.id
            )
            .maybeSingle()

        if (!data) {

          console.log(
            'FIRST LOGIN'
          )

          await createProfile(
            session.user
          )

        }

        setUser(
          session.user
        )

        trackMission({
          userId: session.user.id,
          missionId: 12341,
          amount: 1,
        })

      } else {

        setUser(null)

      }

      setLoading(false)

    }

    loadSession()

    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(

        (_event, session) => {

          setUser(
            session?.user ?? null
          )

        }

      )

    return () => {

      listener.subscription.unsubscribe()

    }

  }, [])

  return (

    <AuthContext.Provider
      value={{
        user,
        loading,
      }}
    >

      {children}

    </AuthContext.Provider>

  )

}