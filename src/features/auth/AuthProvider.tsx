import {
  useEffect,
  useState,
} from "react";

import type {
  User,
} from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

import { getProfile } from "@/features/profile";
import { findProfileByReferralCode, updateProfileRow } from "@/features/profile/services/profileRepository";

import { AuthContext } from "./AuthContext";

import {
  subscribeAction,
  missionConsumer,
  retentionConsumer,
} from "@/core/action-engine";

import { notificationConsumer } from "@/features/notifications/services/notificationSubscriber";

import {
  startMissionScheduler,
  stopMissionScheduler,
} from "@/features/missions/services/missionScheduler";

import { bootstrapRetention } from "@/features/retention";

import { track } from "@/core/action-engine";

import { getReferralCode, clearReferralCode } from "@/lib/referralStorage";

async function processReferralAfterLogin(userId: string) {
  const refCode = getReferralCode();
  if (!refCode) return;

  clearReferralCode();

  try {
    const referrer = await findProfileByReferralCode(refCode);

    if (!referrer || referrer.id === userId) return;

    await updateProfileRow(userId, { referred_by: referrer.id });

    const { count: existingCount } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", referrer.id);

    if (!existingCount) {
      await supabase.from("referrals").insert({
        referrer_id: referrer.id,
        reward_granted: false,
      });
    }

    track("REFERRAL_SUCCESS", referrer.id, {
      referrer_id: referrer.id,
      referred_id: userId,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[REFERRAL] processing failed:", err);
  }
}

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

        async (_event, session) => {

          setUser(
  session?.user ?? null
);

 if (session?.user) {

   sessionStorage.removeItem(
     "redirectAfterLogin"
   );

    if (_event === "SIGNED_IN") {
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