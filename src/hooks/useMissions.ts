import { useQuery } from "@tanstack/react-query";

import { getMissions } from "@/services/wordpress-api";

import { mapMission } from "@/features/missions/missionMapper";

import type {
  MissionConfig,
  WPMission,
} from "@/features/missions/missionTypes";

export function useMissions() {
  return useQuery<MissionConfig[]>({
    queryKey: ["missions"],

    queryFn: async () => {
      const data =
        (await getMissions()) as WPMission[];

      return data.map(mapMission);
    },

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,

    refetchOnWindowFocus: false,

    retry: 2,
  });
}