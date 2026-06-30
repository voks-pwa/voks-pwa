import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

interface UpdateParams {
  id: string;

  status:
    | "approved"
    | "completed"
    | "rejected";
}

export function useUpdateRewardRedemption() {
  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: async ({
      id,
      status,
    }: UpdateParams) => {

      const payload: Record<string, unknown> = {
        reward_status: status,
      };

      if (status === "approved") {

        payload.approved_at =
          new Date().toISOString();

      }

      if (status === "completed") {

        payload.completed_at =
          new Date().toISOString();

      }

      const { error } = await supabase

        .from("reward_redemptions")

        .update(payload)

        .eq("id", id);

      if (error) throw error;
    },

    onSuccess() {

      queryClient.invalidateQueries({

        queryKey: [
          "reward-redemptions",
        ],

      });

    },

  });
}