import {
  useEffect,
  useState,
} from "react";

import type {
  User,
} from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

import {   getProfile,} from "@/features/profile";

import { AuthContext } from "./AuthContext";

import { trackMission } from "@/hooks/useMissionTracker";

import {
  useMissionEventBus,
} from "@/features/missions/hooks/useMissionEventBus";

import {
  startMissionScheduler,
  stopMissionScheduler,
} from "@/features/missions/services/missionScheduler";

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  useMissionEventBus();

  useEffect(() => {

    if (!user) return;

    trackMission({

      userId: user.id,

      missionId: 12341,

      amount: 1,

    });

  }, [user]);

  useEffect(() => {

    if (!user) {

      stopMissionScheduler();

      return;

    }

    startMissionScheduler(user.id);

    return () => {

      stopMissionScheduler();

    };

  }, [user]);

  useEffect(() => {

    async function loadSession() {

      try {

        const {

          data: {

            session,

          },

        } =
          await supabase.auth.getSession();

        if (!session?.user) {

          setUser(null);

          setLoading(false);

          return;

        }

        const profile =
          await getProfile(session.user.id);

        if (!profile) {

          await getProfile(session.user.id);

        }

        setUser(session.user);

      } finally {

        setLoading(false);

      }

    }

    loadSession();

    const {

      data: listener,

    } =
      supabase.auth.onAuthStateChange(

        async (_event, session) => {

          setUser(
            session?.user ?? null
          );

        }

      );

    return () => {

      listener.subscription.unsubscribe();

    };

  }, []);

  return (

    <AuthContext.Provider

      value={{

        user,

        loading,

      }}

    >

      {children}

    </AuthContext.Provider>

  );

}