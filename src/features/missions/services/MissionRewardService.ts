import { awardVXP } from "@/features/profile";

import type { MissionConfig } from "./missionTypes";

export async function processMissionReward(
  userId: string,
  mission: MissionConfig,
) {
  const xpResult =
    await awardVXP(
      userId,
      mission.reward,
    );

  if (!xpResult?.success) {
    return {
      success: false,
      reward: 0,
      claimed: false,
      message:
        xpResult?.message ??
        "Failed to award VXP",
    };
  }

    return {
        success: true,
        reward: mission.reward,
        claimed: true,
        message: "Reward granted",
    };
 }