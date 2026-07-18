import { useQuery } from "@tanstack/react-query";

import { getMissions } from "@/services/wordpress-api";

import { mapMission } from "@/features/missions/services/missionMapper";

import type {
  MissionConfig,
  WPMission,
} from "@/features/missions/services/missionTypes";

export function useMission(id: number | undefined) {
  return useQuery<MissionConfig[], Error, MissionConfig | null>({
    queryKey: ["missions"],

    queryFn: async () => {
      const data = (await getMissions()) as WPMission[];

      return data.map(mapMission);
    },

    select: (missions) => {
      if (!id) return null;
      return missions.find((m) => m.id === id) ?? null;
    },

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,

    enabled: !!id,
  });
}
