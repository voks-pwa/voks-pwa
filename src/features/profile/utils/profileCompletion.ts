import type { Profile } from "../types";

const FIELD_COUNT = 11;
const FIELD_WEIGHT = 100 / FIELD_COUNT;

const REQUIRED_FIELDS: Array<keyof Profile> = [
  "full_name",
  "display_name",
  "phone_number",
  "birthday",
  "gender",
  "province",
  "city",
  "favorite_program",
  "favorite_music",
  "instagram",
  "tiktok",
];

export function calculateProfileCompletion(profile: Profile) {
  const filled = REQUIRED_FIELDS.filter((field) => Boolean(profile[field]));
  const completed = filled.length;
  return Math.min(Math.round(completed * FIELD_WEIGHT), 100);
}

export function isProfileCompleted(profile: Profile) {
  return calculateProfileCompletion(profile) >= 100;
}
