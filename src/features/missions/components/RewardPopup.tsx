import { useEffect } from "react";

import { RewardToast } from "./RewardToast";

import { useMissionStore } from "../missionStore";

export function RewardPopup() {

  const latestReward =
    useMissionStore(
      (state) => state.latestReward
    );

  const clearLatestReward =
    useMissionStore(
      (state) => state.clearLatestReward
    );

  useEffect(() => {

    if (!latestReward) return;

    const timer =
      window.setTimeout(() => {

        clearLatestReward();

      }, 3500);

    return () => clearTimeout(timer);

  }, [
    latestReward,
    clearLatestReward,
  ]);

  if (!latestReward) {

    return null;

  }

  return (

    <div className="fixed right-6 top-6 z-9999 animate-in slide-in-from-right duration-500">

      <RewardToast
        mission={`Mission #${latestReward.missionId}`}
        reward={latestReward.reward}
        progress={latestReward.progress}
        target={latestReward.target}
      />

    </div>

  );

}