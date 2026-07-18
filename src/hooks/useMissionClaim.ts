import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth";
import { processMissionClaim } from "@/features/missions/services/MissionClaimService";
import { getMission } from "@/features/missions/services/missionWP";

export function useMissionClaim() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: number) => {
      if (!user) throw new Error("Not authenticated");

      const mission = await getMission(missionId);
      if (!mission) throw new Error("Mission not found");

      const result = await processMissionClaim(user.id, mission);
      if (!result.success) throw new Error(result.message);

      return result;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["missions-progress", user?.id],
      });
    },
  });
}
