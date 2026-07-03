import { useUpdateProfileMutation } from "../mutations/profileMutations";

export function useUpdateProfile() {
  return useUpdateProfileMutation();
}