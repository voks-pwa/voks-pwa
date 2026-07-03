import type { Profile } from "../types";

export function calculateProfileCompletion(
  profile: Profile
) {
  const fields = [

    profile.display_name,

    profile.phone,

    profile.city,

    profile.gender,

    profile.birth_date,

    profile.bio,

    profile.avatar_url,

  ];

  const completed =
    fields.filter(Boolean).length;

  return Math.round(
    (completed / fields.length) * 100
  );
}

export function isProfileCompleted(
  profile: Profile
) {
  return (
    calculateProfileCompletion(profile) >= 100
  );
}