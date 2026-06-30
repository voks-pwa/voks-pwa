import { useNotificationStore } from "./notificationStore";

type MissionNotificationInput = {

  missionId: number;

  missionTitle: string;

  reward: number;

  progress: number;

};

export function pushMissionNotification(
  input: MissionNotificationInput
) {

  useNotificationStore
    .getState()
    .addNotification({

      type: "mission",

      missionId: input.missionId,

      title: "Mission Completed",

      message:
        `${input.missionTitle} berhasil diselesaikan.`,

      reward: input.reward,

      progress: input.progress,

    });

}