import { useQuery } from "@tanstack/react-query";

import { getCanonicalUser } from "../services/userCanonicalService";
import { useAuth } from "@/features/auth/useAuth";

export function useCanonicalUser(userId?: string) {
  const { user } = useAuth();
  const resolvedId = userId ?? user?.id;

  return useQuery({
    queryKey: ["canonical-user", resolvedId],
    queryFn: () => {
      console.log("[CANONICAL USER] cache hit", resolvedId);
      return getCanonicalUser(resolvedId!);
    },
    enabled: !!resolvedId,
    staleTime: 1000 * 60 * 5,
  });
}
