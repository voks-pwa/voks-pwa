import { BottomSheet } from "@/components/BottomSheet";
import {
  Gift,
  Ticket,
  Package,
  Calendar,
  Coins,
} from "lucide-react";

import type { Reward } from "../rewardTypes";

import { useRedeemReward } from "@/hooks/useRedeemReward";



interface Props {
  reward: Reward | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getIcon(type: string) {
  switch (type) {
    case "digital":
      return <Ticket size={18} />;

    case "pickup":
      return <Package size={18} />;

    default:
      return <Gift size={18} />;
  }
}



export function RewardDetailSheet({
  reward,
  open,
  onOpenChange,
}: Props) {

  const redeemMutation = useRedeemReward();

  if (!reward) return null;

   return (

    <BottomSheet
      open={open}
      onClose={() => onOpenChange(false)}
    >
      <div className="flex h-full flex-col">

        {/* IMAGE */}

        <img
          src={reward.image}
          alt={reward.title}
          className="
            h-60
            w-full
            object-cover
            flexshrink-0
          "
        />

        {/* SCROLLABLE CONTENT */}

        <div
          className="
            flex-1
            overflow-y-auto
            px-6
            py-5
            space-y-6
          "
        >
          <div>
            <h2 className="text-2xl font-bold">
              {reward.title}
            </h2>

            <p className="text-gray-500">
              {reward.subtitle}
            </p>
          </div>

          {/* COST */}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins
                size={18}
                className="text-[#bda752]"
              />
              <span>Redeem Cost</span>
            </div>

            <span className="font-black text-[#bda752]">
              {reward.cost} VXP
            </span>
          </div>

          {/* STOCK */}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getIcon(reward.deliveryType)}
              <span>Stock</span>
            </div>

            <span className="font-semibold">
              {reward.stock}
            </span>
          </div>

          {/* EXPIRED */}

          {reward.expiredAt && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>Expired</span>
              </div>

              <span>{reward.expiredAt}</span>
            </div>
          )}

          {/* DESCRIPTION */}

          <div>
            <h3 className="font-bold">
              Description
            </h3>

            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
              {reward.description}
            </p>
          </div>

          {/* TERMS */}

          {reward.terms && (
            <div>
              <h3 className="font-bold">
                Terms & Conditions
              </h3>

              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                {reward.terms}
              </p>
            </div>
          )}

          {/* DELIVERY */}

          {reward.deliveryNotes && (
            <div>
              <h3 className="font-bold">
                Delivery
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                {reward.deliveryNotes}
              </p>
            </div>
          )}

          {/* BONUS */}

          {reward.bonusVxp > 0 && (
            <div className="rounded-2xl bg-amber-50 p-4">
              <h3 className="font-bold">
                Bonus
              </h3>

              <p className="mt-2 text-sm">
                Redeem reward ini mendapatkan bonus

                <span className="font-bold text-[#bda752]">
                  {" "}
                  +{reward.bonusVxp} VXP
                </span>
              </p>
            </div>
          )}

          {/* spacer supaya konten terakhir tidak ketutup footer */}

          <div className="h-4" />

        </div>

        {/* STICKY FOOTER */}

       <div
  className="
    border-t
    border-gray-200
    bg-white
    px-6
    pt-4
    pb-[calc(88px+env(safe-area-inset-bottom))]
    shadow-[0_-4px_20px_rgba(0,0,0,0.05)]
    flexshrink-0
  "
>
          <button
    disabled={redeemMutation.isPending}
    onClick={() => {

        redeemMutation.mutate(

            {

                id: reward.id,

                slug: reward.slug,

                title: reward.title,

                cost: reward.cost,

            },

            {

                onSuccess: () => {

                    onOpenChange(false);

                }

            }

        );

    }}
    className="
        mt-2
        w-full
        rounded-2xl
        bg-[#bda752]
        py-4
        text-lg
        font-bold
        text-white
        disabled:opacity-50
    "
>

    {

        redeemMutation.isPending

            ? "Redeeming..."

            : "Redeem Reward"

    }

</button>
        </div>

      </div>
    </BottomSheet>
  );
}