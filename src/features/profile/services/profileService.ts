import {
  findProfile,
  findProfiles,
  updateProfileRow,
} from "./profileRepository";
import { calculateProfileCompletion } from "../utils/profileCompletion";
import { track } from "@/core/action-engine";
import type { UpdateProfileInput } from "../types";

export const getProfile = findProfile;
export const getProfiles = findProfiles;

function generateReferralCode(): string {
  return crypto.randomUUID().slice(0, 8).toUpperCase();
}

export async function updateProfile(id: string, input: UpdateProfileInput) {
  if (!input.referral_code) {
    const existing = await findProfile(id);
    if (existing && !existing.referral_code) {
      input.referral_code = generateReferralCode();
    }
  }

  const profile = await updateProfileRow(id, input);

  const completion = calculateProfileCompletion(profile);

  if (completion >= 100 && !profile.profile_reward_claimed) {
    const updates: UpdateProfileInput = {
      profile_completed: true,
      profile_reward_claimed: true,
    };

    await updateProfileRow(id, updates);

    track("PROFILE_COMPLETED", id, { completed_at: new Date().toISOString() });
  }

  return profile;
}

export async function ensureReferralCode(id: string) {
  const profile = await findProfile(id);
  if (profile && !profile.referral_code) {
    const code = generateReferralCode();
    await updateProfileRow(id, { referral_code: code });
    return code;
  }
  return profile?.referral_code;
}
