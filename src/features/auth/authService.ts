import { supabase } from "@/lib/supabase";
import { isPilotAtCap } from "./pilotConfig";

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