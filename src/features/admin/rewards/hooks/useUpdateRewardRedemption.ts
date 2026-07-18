import { useMutation, useQueryClient } from "@tanstack/react-query";

import { rewardService } from "../services/rewardService";

export function useUpdateRewardRedemption() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      redemptionId,
      status,
      notes,
    }: {
      redemptionId: string;
      status: string;
      notes?: string;
    }) =>
      rewardService.updateRewardRedemption(
        redemptionId,
        status,
        notes
      ),

    onSuccess() {
      qc.invalidateQueries({
        queryKey: ["admin-rewards"],
      });
    },
  });
}