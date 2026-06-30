import { useMutation, useQueryClient } from "@tanstack/react-query";

import { redeemReward } from "@/services/reward-service";

export function useRedeemReward() {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: redeemReward,

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey:["profile"]
            });

            queryClient.invalidateQueries({
                queryKey:["rewards"]
            });

        }

    });

}