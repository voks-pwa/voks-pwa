import { useQuery } from "@tanstack/react-query";
import { getMilestones } from "../repositories/milestoneRepository";
import { useAuth } from "@/features/auth/useAuth";

export function useMilestones() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["milestones", user?.id],
    enabled: !!user,
    queryFn: () => getMilestones(user!.id),
  });
}
