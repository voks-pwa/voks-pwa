import { useState } from "react";
import { Gift } from "lucide-react";

import { useActiveRewardAggregate } from "../hooks/useRewardAggregate";
import { RewardCard } from "./RewardCard";
import { RewardDetailSheet } from "./RewardDetailSheet";

import type { RewardAggregate } from "../types/rewardAggregate";

export function RewardGrid() {
  const {
    data = [],
    isLoading,
    isError,
  } = useActiveRewardAggregate();

  const [selectedReward, setSelectedReward] = useState<RewardAggregate | null>(null);
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-3xl bg-gray-200" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
        <Gift size={48} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-bold">Failed to load rewards</h3>
        <p className="mt-2 text-sm text-gray-500">
          Please try again later.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {data.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            onClick={() => {
              setSelectedReward(reward);
              setOpen(true);
            }}
          />
        ))}
      </div>

      <RewardDetailSheet
        reward={selectedReward}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}