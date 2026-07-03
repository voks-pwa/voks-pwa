import {
  findProfile,
  findProfiles,
  updateProfileRow,
} from "./profileRepository";

export const getProfile = findProfile;

export const getProfiles = findProfiles;

export async function updateProfile(
  id: string,
  input: any,
) {
  return updateProfileRow(id, input);
}