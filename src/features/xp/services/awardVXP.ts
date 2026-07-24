import { credit } from "@/features/wallet/services/walletEngine";

export interface AwardVXPInput {
  userId: string;
  amount: number;
  reason: string;
  reference_id?: string;
}

export async function awardVXP({
  userId,
  amount,
  reason,
  reference_id,
}: AwardVXPInput) {
  return credit({
    userId,
    amount,
    transactionType: "MISSION_REWARD",
    transactionKey: reference_id ? `MISSION_REWARD_${userId}_${reference_id}` : undefined,
    referenceType: "mission",
    referenceId: reference_id,
    description: reason,
  });
}
