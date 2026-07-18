import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getAdminMissionStats,
  updateMission,
} from "../api/missions";

import type {
  UpdateMissionPayload,
} from "../api/missions";

export function useAdminMissions() {
  return useQuery({
    queryKey: ["admin-missions"],
    queryFn: getAdminMissionStats,
    initialData: {},
  });
}

export function useUpdateMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: UpdateMissionPayload
    ) => updateMission(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-missions"],
      });
    },
  });
}