import { useQuery } from "@tanstack/react-query";

import { getProfile } from "../services/profileService";
import { profileKeys } from "../queries/profileQueries";
import { useAuth } from "@/features/auth/useAuth";

export function useProfile(id?: string) {
  const { user } = useAuth();
  const resolvedId = id ?? user?.id;

  return useQuery({
    queryKey: resolvedId ? profileKeys.detail(resolvedId) : ["profile", "empty"],
    enabled: !!resolvedId,
    queryFn: () => getProfile(resolvedId!),
  });
}
