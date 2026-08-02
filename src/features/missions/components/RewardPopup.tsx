import { useEffect, useRef } from "react";

import { RewardToast } from "./RewardToast";

import { useMissionStore } from "../services/missionStore";

const AUTO_DISMISS_MS = 4000;

export function RewardPopup() {

  const latestReward =
    useMissionStore(
      (state) => state.latestReward
    );

  const clearLatestReward =
    useMissionStore(
      (state) => state.clearLatestReward
    );

  const timerRef = useRef<number | null>(null);

  useEffect(() => {

    if (!latestReward) return;

    timerRef.current =
      window.setTimeout(() => {

        clearLatestReward();
        timerRef.current = null;

      }, AUTO_DISMISS_MS);

    return () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

  }, [
    latestReward,
    clearLatestReward,
  ]);

  if (!latestReward) {

    return null;

  }

  return (

    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-500">

      <RewardToast
        mission={latestReward.missionTitle || `Mission #${latestReward.missionId}`}
        reward={latestReward.reward}
        onDismiss={clearLatestReward}
      />

    </div>

  );

}
