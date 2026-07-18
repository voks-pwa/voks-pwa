import { useEffect, useRef } from "react";

import { RewardToast } from "./RewardToast";

import { useMissionStore } from "../services/missionStore";

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

      }, 3500);

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

    <div className="fixed right-6 top-6 z-50 animate-in slide-in-from-right duration-500">

      <RewardToast
        mission={`Mission #${latestReward.missionId}`}
        reward={latestReward.reward}
        progress={latestReward.progress}
        target={latestReward.target}
      />

    </div>

  );

}
