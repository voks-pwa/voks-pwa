import { useQuery } from "@tanstack/react-query";

import { getProfiles } from "../services/profileService";
import { profileKeys } from "../queries/profileQueries";

export function useProfiles() {
  return useQuery({
    queryKey: profileKeys.list(),
    queryFn: getProfiles,
  });
}