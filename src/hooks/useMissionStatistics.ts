import { useMemo } from "react";

import { useMissions } from "@/hooks/useMissions";
import { useMissionProgress } from "@/hooks/useMissionProgress";

export function useMissionStatistics() {
  const {
    data: missions = [],
    isLoading: missionsLoading,
  } = useMissions();

  const {
    data: progress = [],
    isLoading: progressLoading,
  } = useMissionProgress();

  return useMemo(() => {
    const completed =
      progress.filter((p) => p.completed).length;

    const claimed =
      progress.filter((p) => p.claimed).length;

    return {
      total: missions.length,
      completed,
      claimed,
      loading: missionsLoading || progressLoading,
    };
  }, [missions, progress, missionsLoading, progressLoading]);
}