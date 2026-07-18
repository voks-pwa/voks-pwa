import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { loadCampaignMissions } from "../services/campaignMissionLoader";
import { useMissionProgress } from "@/hooks/useMissionProgress";
import type { MissionConfig } from "@/features/missions/types/mission";
import type { MissionProgress } from "@/features/missions/types/progress";

export interface CampaignMissionState {
  missions: MissionConfig[];
  progressByMission: Map<number, MissionProgress>;
  total: number;
  completed: number;
  inProgress: number;
  locked: number;
  remaining: number;
  totalVxp: number;
  completedVxp: number;
  completionRatio: number;
  hasMissions: boolean;
}

function buildState(
  missions: MissionConfig[],
  progress: MissionProgress[] | undefined,
): CampaignMissionState {
  const progressByMission = new Map<number, MissionProgress>();
  for (const p of progress ?? []) {
    progressByMission.set(p.mission_id, p);
  }

  let completed = 0;
  let inProgress = 0;
  let locked = 0;
  let totalVxp = 0;
  let completedVxp = 0;

  for (const m of missions) {
    totalVxp += m.reward;
    const p = progressByMission.get(m.id);
    if (p?.completed) {
      completed += 1;
      completedVxp += m.reward;
    } else if (p && !p.completed && !p.claimed) {
      inProgress += 1;
    } else if (!m.active) {
      locked += 1;
    }
  }

  const total = missions.length;
  const remaining = total - completed;
  const completionRatio = total > 0 ? completed / total : 0;

  return {
    missions,
    progressByMission,
    total,
    completed,
    inProgress,
    locked,
    remaining,
    totalVxp,
    completedVxp,
    completionRatio,
    hasMissions: total > 0,
  };
}

/**
 * React Query hook for a campaign's grouped missions. Progress/state is
 * read entirely from the Mission Engine (`useMissionProgress`) — Campaign
 * only renders the result.
 */
export function useCampaignMissions(campaignSlug: string | undefined) {
  const { data: progress } = useMissionProgress();

  const query = useQuery({
    queryKey: ["campaign-missions", campaignSlug],
    enabled: Boolean(campaignSlug),
    queryFn: () => loadCampaignMissions(campaignSlug as string),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  const state = useMemo(
    () => buildState(query.data ?? [], progress),
    [query.data, progress],
  );

  return { ...query, state };
}
