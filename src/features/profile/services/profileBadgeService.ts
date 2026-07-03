import { updateProfile } from "./profileService";

export async function updateBadge(
  userId: string,
  badge: string,
) {

  return updateProfile(userId,{
      badge_name:badge,
  });

}