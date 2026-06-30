import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Gift } from "lucide-react";

import { useRewards } from "@/hooks/useRewards";

import { RewardCard } from "@/features/rewards/components/RewardCard";
import { RewardDetailSheet } from "@/features/rewards/components/RewardDetailSheet";

import type { Reward } from "@/features/rewards/rewardTypes";

export function RewardStorePage() {
  const { data: rewards = [], isLoading } = useRewards();

  const [selectedReward, setSelectedReward] =
    useState<Reward | null>(null);

  const [open, setOpen] =
    useState(false);

  return (
    <>
      <div className="mx-auto max-w-2xl p-4">

        {/* Header */}

        <div className="mb-6 flex items-center gap-4">

          <Link
            to="/more"
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-white
              shadow-sm
            "
          >
            <ArrowLeft size={20} />
          </Link>

          <div>

            <h1 className="text-2xl font-black">
              Reward Store
            </h1>

            <p className="text-sm text-gray-500">
              Redeem your VXP for exclusive rewards
            </p>

          </div>

        </div>

        {/* Hero */}

        <div
          className="
            mb-6
            rounded-3xl
            bg-gradient-to-br
            from-[#5d5b3d]
            via-[#887845]
            to-[#bda752]
            p-6
            text-white
          "
        >

          <div className="flex items-center gap-4">

            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-white/20
              "
            >
              <Gift size={28} />
            </div>

            <div>

              <h2 className="text-2xl font-bold">
                Reward Store
              </h2>

              <p className="mt-1 text-white/80">
                Exchange your VXP for vouchers,
                merchandise and exclusive gifts.
              </p>

            </div>

          </div>

        </div>

        {/* Loading */}

        {isLoading && (

          <div className="grid grid-cols-2 gap-5">

            {Array.from({ length: 4 }).map((_, i) => (

              <div
                key={i}
                className="
                  h-72
                  animate-pulse
                  rounded-3xl
                  bg-gray-200
                "
              />

            ))}

          </div>

        )}

        {/* Empty */}

        {!isLoading && rewards.length === 0 && (

          <div
            className="
              rounded-3xl
              bg-white
              p-10
              text-center
              shadow-sm
            "
          >

            <Gift
              size={48}
              className="
                mx-auto
                mb-4
                text-gray-300
              "
            />

            <h3 className="text-lg font-bold">
              No Rewards Available
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Check back later for new rewards.
            </p>

          </div>

        )}

        {/* Reward Grid */}

        {!isLoading && rewards.length > 0 && (

          <div className="grid grid-cols-2 gap-5">

            {rewards.map((reward) => (

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

        )}

      </div>

      {/* Detail Sheet */}

      <RewardDetailSheet
        reward={selectedReward}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
