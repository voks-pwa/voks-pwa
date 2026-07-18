import { useQuery } from "@tanstack/react-query";
import { getBadges } from "../repositories/badgeRepository";
import { useAuth } from "@/features/auth/useAuth";

export function useBadges() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["badges", user?.id],
    enabled: !!user,
    queryFn: () => getBadges(user!.id),
  });
}
