import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import { isPilotAtCap } from "./pilotConfig";
import { track } from "@/core/action-engine";
import { getReferralCode, clearReferralCode } from "@/lib/referralStorage";
import { findProfile, findProfileByReferralCode, updateProfileRow } from "@/features/profile/services/profileRepository";
import { calculateProfileCompletion } from "@/features/profile/utils/profileCompletion";

export async function syncAuthProfile(authUser: User) {
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

export async function handlePostLogin(user: User) {
  sessionStorage.removeItem("redirectAfterLogin");
  track("USER_LOGIN", user.id, {
    at: new Date().toISOString(),
  });
  await processReferralAfterLogin(user.id);
  await syncAuthProfile(user);
  await checkAndFireProfileCompletion(user.id);
}

export async function checkAndFireProfileCompletion(userId: string) {
  try {
    const profile = await findProfile(userId);
    if (!profile) return;

    const completion = calculateProfileCompletion(profile);
    if (completion >= 100 && !profile.profile_reward_claimed) {
      await supabase.rpc("set_profile_completion", { p_user_id: userId });
      track("PROFILE_COMPLETED", userId, { completed_at: new Date().toISOString() });
    }
  } catch (err) {
    console.error("[AUTH] profile completion check failed:", err);
  }
}

export async function processReferralAfterLogin(userId: string) {
  const refCode = getReferralCode();
  if (!refCode) return;

  clearReferralCode();

  try {
    const referrer = await findProfileByReferralCode(refCode);

    if (!referrer || referrer.id === userId) return;

    await supabase.rpc("set_referred_by", {
      p_user_id: userId,
      p_referrer_id: referrer.id,
    });

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

export async function loginGoogle() {

  if (await isPilotAtCap()) {
    console.warn("[PILOT] login blocked — pilot at capacity");
    throw new Error("Pilot registration is full. Please try again later.");
  }


  /*
   * halaman yang diminta sebelum login
   */

  const ALLOWED_REDIRECT_PATHS = ["/", "/profile", "/missions", "/rewards", "/leaderboard", "/more", "/programs", "/live", "/campaigns", "/notifications"];

  const rawPath = sessionStorage.getItem("redirectAfterLogin") ?? "/";
  const redirectPath = ALLOWED_REDIRECT_PATHS.includes(rawPath) ? rawPath : "/";

  /*
   * redirect OAuth
   */

  await supabase.auth.signInWithOAuth({

    provider: "google",

    options: {

      redirectTo:
        `${window.location.origin}${redirectPath}`,

    },

  });

}

export async function logout() {

  sessionStorage.removeItem(
    "redirectAfterLogin"
  );

  await supabase.auth.signOut();

}