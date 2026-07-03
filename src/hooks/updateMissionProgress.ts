import { missionEngine } from "@/features/missions/services/missionEngine";

interface UpdateMissionProgressInput {
  userId: string;
  missionId: number;
  amount?: number;
  action?: string;
}

export async function updateMissionProgress({
  userId,
  missionId,
  amount = 1,
  action = "listen_tick",
}: UpdateMissionProgressInput) {
  return missionEngine({
    userId,
    missionId,
    amount,
    action,
  });
}