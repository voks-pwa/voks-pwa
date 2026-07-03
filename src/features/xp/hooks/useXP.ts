import { useMutation } from "@tanstack/react-query";

import { awardVXP } from "@/features/profile/services/profileXPService";

export function useXP() {

  return useMutation({

    mutationFn: ({
      userId,
      amount,
        }: {
      userId: string;
      amount: number;
    }) =>
      awardVXP(
        userId,
        amount,
      ),

  });

}