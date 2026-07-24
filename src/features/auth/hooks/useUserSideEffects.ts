import { useEffect } from "react";

import {
  startMissionScheduler,
  stopMissionScheduler,
} from "@/features/missions/services/missionScheduler";

import { bootstrapRetention } from "@/features/retention";

export function useUserSideEffects(userId: string | null) {
  useEffect(() => {
    if (!userId) {
      stopMissionScheduler();
      return;
    }

    startMissionScheduler(userId);

    void bootstrapRetention().catch((e) =>
      console.error("[RETENTION] bootstrap failed", e),
    );

    return () => {
      stopMissionScheduler();
    };
  }, [userId]);
}
