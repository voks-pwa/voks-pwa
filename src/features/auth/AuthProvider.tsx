import {
  useEffect,
  useState,
} from "react";

import type {
  User,
} from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

import { getProfile } from "@/features/profile";
import { updateProfileRow } from "@/features/profile/services/profileRepository";

import { AuthContext } from "./AuthContext";
import { processReferralAfterLogin } from "./authService";

import {
  subscribeAction,
  missionConsumer,
  retentionConsumer,
  track,
} from "@/core/action-engine";

import { notificationConsumer } from "@/features/notifications/services/notificationSubscriber";

import {
  startMissionScheduler,
  stopMissionScheduler,
} from "@/features/missions/services/missionScheduler";

import { bootstrapRetention } from "@/features/retention";

async function syncAuthProfile(authUser: User) {
  try {
    const avatarUrl =
      (authUser.user_metadata?.avatar_url as string) ??
      (authUser.user_metadata?.picture as string) ??
      null;

    const updates: Record<string, string | null> = {
      email: authUser.email ?? "",
    };

    if (avatarUrl) {
      updates.avatar_url = avatarUrl;
    }

    await updateProfileRow(authUser.id, updates);
  } catch (err) {
    console.error("[AUTH] profile sync failed:", err);
  }
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const unsubMission = subscribeAction(missionConsumer);
    const unsubRetention = subscribeAction(retentionConsumer);
    const unsubNotification = subscribeAction(notificationConsumer);
    return () => {
      unsubMission();
      unsubRetention();
      unsubNotification();
    };
  }, []);

  useEffect(() => {

    if (!user) {

      stopMissionScheduler();

      return;

    }

    startMissionScheduler(user.id);

    void bootstrapRetention().catch((e) =>
      console.error("[RETENTION] bootstrap failed", e),
    );

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

        async (event: string, session) => {

  const newUser = session?.user ?? null;
  setUser((prev) => {
    if (prev?.id === newUser?.id) return prev;
    return newUser;
  });

 if (session?.user) {

   sessionStorage.removeItem(
     "redirectAfterLogin"
   );

    if (event === "SIGNED_IN") {
      track("USER_LOGIN", session.user.id, {
        at: new Date().toISOString(),
      });

      void processReferralAfterLogin(session.user.id);
      void syncAuthProfile(session.user);
    }

  }

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