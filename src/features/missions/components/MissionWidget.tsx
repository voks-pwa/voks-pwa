import { useMissionStore } from "../missionStore"

import { MissionProgressCard } from "./MissionProgressCard"
import { MissionRewardCard } from "./MissionRewardCard"

export function MissionWidget() {
  const progress =
    useMissionStore(
      (state) => state.progress
    )

  const firstMission =
    Object.values(progress)[0]

  if (!firstMission) {
    return null
  }

  return (
    <div className="space-y-5">

      <MissionProgressCard
        title="Today's Mission"
        progress={firstMission.progress}
        target={firstMission.target}
        completed={firstMission.completed}
      />

      <MissionRewardCard
        reward={firstMission.reward}
        completed={firstMission.completed}
        claimed={firstMission.claimed}
        onClaim={() =>

          useMissionStore
            .getState()
            .claimReward(
              firstMission.missionId
            )

        }
      />

    </div>
  )
}