import { supabase } from "@/lib/supabase";
import {
  findProfile,
  findProfiles,
  findProfileByReferralCode,
  updateProfileRow,
} from "./profileRepository";
import { calculateProfileCompletion } from "../utils/profileCompletion";
import { track } from "@/core/action-engine";
import type { UpdateProfileInput } from "../types";

export const getProfile = findProfile;
export const getProfiles = findProfiles;

async function generateReferralCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const digits = Math.floor(1000 + Math.random() * 9000)
    const code = `voks-${digits}`
    const existing = await findProfileByReferralCode(code)
    if (!existing) return code
  }
  throw new Error("Failed to generate unique referral code after 10 attempts");
}

export async function updateProfile(id: string, input: UpdateProfileInput) {
  if (!input.referral_code) {
    const existing = await findProfile(id);
    if (existing && !existing.referral_code) {
      input.referral_code = await generateReferralCode();
    }
  }

  const profile = await updateProfileRow(id, input);

  const completion = calculateProfileCompletion(profile);

  if (completion >= 100 && !profile.profile_reward_claimed) {
    await supabase.rpc("set_profile_completion", { p_user_id: id });

    track("PROFILE_COMPLETED", id, { completed_at: new Date().toISOString() });
  }

  return profile;
}

export async function ensureReferralCode(id: string) {
  const profile = await findProfile(id);
  if (profile && !profile.referral_code) {
    const code = await generateReferralCode();
    await updateProfileRow(id, { referral_code: code });
    return code;
  }
  return profile?.referral_code;
}
