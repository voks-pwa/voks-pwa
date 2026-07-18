import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getAdminRewards,
  updateReward,
} from "../api/rewards-crud";

import type {
  UpdateRewardPayload,
} from "../api/rewards-crud";

export function useAdminRewards() {
  return useQuery({
    queryKey: ["admin-rewards-catalog"],
    queryFn: getAdminRewards,
    initialData: [],
  });
}

export function useUpdateReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: UpdateRewardPayload
    ) => updateReward(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-rewards-catalog"],
      });
    },
  });
}
