import { useQuery } from "@tanstack/react-query";

import { getProfile } from "../services/profileService";
import { profileKeys } from "../queries/profileQueries";

export function useProfile(id?: string) {
  return useQuery({
    queryKey: id ? profileKeys.detail(id) : ["profile", "empty"],
    enabled: !!id,
    queryFn: () => getProfile(id!),
  });
}