import type { MissionConfig } from "../types/mission";

export async function processMissionReward(_userId: string, mission: MissionConfig) {
  return {
    success: true,
    reward: mission.reward,
    claimed: false,
    message: "Reward ready — claim via RPC",
  };
}
