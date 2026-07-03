import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { useWriteAdminAudit } from "@/features/admin/shared/useAdminAudit";
import { useProfile } from "@/hooks/useProfile";

interface UpdateParams {
  id: string;

  status:
    | "approved"
    | "completed"
    | "rejected";
}

export function useUpdateRewardRedemption() {
  const queryClient = useQueryClient();
  const writeAudit = useWriteAdminAudit();
  const { data: profile } = useProfile();

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

      await writeAudit.mutateAsync({
        actorId: profile?.id ?? null,
        actorName: profile?.display_name ?? profile?.email ?? "admin",
        action: `reward_status:${status}`,
        entity: "reward_redemption",
        entityId: id,
        details: `Reward redemption status updated to ${status}`,
      });
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