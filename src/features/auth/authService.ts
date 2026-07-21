import { supabase } from "@/lib/supabase";
import { isPilotAtCap } from "./pilotConfig";
import { track } from "@/core/action-engine";
import { getReferralCode, clearReferralCode } from "@/lib/referralStorage";
import { findProfileByReferralCode, updateProfileRow } from "@/features/profile/services/profileRepository";

export async function processReferralAfterLogin(userId: string) {
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

export async function loginGoogle() {

  if (await isPilotAtCap()) {
    console.warn("[PILOT] login blocked — pilot at capacity");
    throw new Error("Pilot registration is full. Please try again later.");
  }


  /*
   * halaman yang diminta sebelum login
   */

  const redirectPath =
    sessionStorage.getItem(
      "redirectAfterLogin"
    ) ?? "/";

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