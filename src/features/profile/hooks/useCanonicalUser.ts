import { useQuery } from "@tanstack/react-query";

import { getCanonicalUser } from "../services/userCanonicalService";
import { useAuth } from "@/features/auth/useAuth";

export function useCanonicalUser(userId?: string) {
  const { user } = useAuth();
  const resolvedId = userId ?? user?.id;

  return useQuery({
    queryKey: ["canonical-user", resolvedId],
    queryFn: () => getCanonicalUser(resolvedId!),
    enabled: !!resolvedId,
  });
}
