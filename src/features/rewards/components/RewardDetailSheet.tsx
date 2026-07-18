import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { BottomSheet } from "@/components/BottomSheet";
import {
  Gift,
  Ticket,
  Package,
  Calendar,
  Coins,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";

import { useRewardEligibility } from "../hooks/useRewardEligibility";
import { useRedeem } from "@/features/redeem/hooks/useRedeem";
import { showToast } from "@/components/ui/showToast";

import type { RewardAggregate } from "../types/rewardAggregate";

interface Props {
  reward: RewardAggregate | null;
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

  const { data: eligibility, isLoading: checkingEligibility } = useRewardEligibility(reward);

  const redeemMutation = useRedeem();

  const handleRedeem = async () => {
    if (!reward) return;
    const result = await redeemMutation.mutateAsync({
      rewardId: reward.id,
      rewardTitle: reward.name,
      requiredVxp: reward.cost,
      approvalRequired: false,
    });
    if (result.success) {
      showToast({ type: "success", title: result.message });
      onOpenChange(false);
    } else {
      showToast({ type: "error", title: "Failed to redeem", message: result.message });
    }
  };

  if (!reward) return null;

  const isExpired = reward.expired_at
    ? new Date(reward.expired_at) < new Date()
    : false;

  const isEligible = eligibility?.eligible === true && !isExpired && reward.available > 0;

  return (

    <BottomSheet
      open={open}
      onClose={() => {
        onOpenChange(false);
      }}
    >
      <div className="flex h-full flex-col">

        <div className="h-60 w-full overflow-hidden bg-gradient-to-br from-[#5d5b3d] via-[#887845] to-[#bda752]">
          <img
            src={reward.image_url}
            alt={reward.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none'
            }}
          />
        </div>

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
              {reward.name}
            </h2>
            <p className="text-gray-500">
              {reward.subtitle}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins size={18} className="text-[#bda752]" />
              <span>Redeem Cost</span>
            </div>
            <span className="font-black text-[#bda752]">
              {reward.cost} VXP
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getIcon(reward.delivery_type)}
              <span>Stock</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-[#bda752] transition-all"
                  style={{
                    width: `${Math.min(100, (reward.stock / Math.max(reward.stock, 10)) * 100)}%`,
                  }}
                />
              </div>
              <span className="font-semibold text-sm">
                {reward.stock}
              </span>
            </div>
          </div>

          {isExpired && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-3 text-sm text-red-600">
              <AlertTriangle size={16} />
              <span>This reward has expired</span>
            </div>
          )}

          {reward.expired_at && !isExpired && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>Expires</span>
              </div>
              <span>{new Date(reward.expired_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getIcon(reward.delivery_type)}
              <span>Category</span>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 capitalize">
              {reward.delivery_type}
            </span>
          </div>

          {reward.campaign_slug && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift size={18} />
                <span>Campaign</span>
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {reward.campaign_slug}
              </span>
            </div>
          )}

          <div>
            <h3 className="font-bold">
              Description
            </h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
              {reward.description}
            </p>
          </div>

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

          {reward.delivery_notes && (
            <div>
              <h3 className="font-bold">
                Delivery
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {reward.delivery_notes}
              </p>
            </div>
          )}

          {reward.bonus_vxp > 0 && (
            <div className="rounded-2xl bg-amber-50 p-4">
              <h3 className="font-bold">
                Bonus
              </h3>
              <p className="mt-2 text-sm">
                Redeem this reward to get a bonus of

                <span className="font-bold text-[#bda752]">
                  {" "}
                  +{reward.bonus_vxp} VXP
                </span>
              </p>
            </div>
          )}

          {/* Eligibility Status */}

          {checkingEligibility && (
            <div className="flex items-center gap-2 rounded-2xl bg-gray-50 p-3 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" />
              <span>Checking eligibility...</span>
            </div>
          )}

          {!checkingEligibility && eligibility && !eligibility.eligible && !isExpired && reward.stock > 0 && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-3 text-sm text-red-600">
              <XCircle size={16} />
              <span>{eligibility.reason}</span>
            </div>
          )}

          {!checkingEligibility && eligibility && eligibility.eligible && !isExpired && reward.stock > 0 && (
            <div className="flex items-center gap-2 rounded-2xl bg-green-50 p-3 text-sm text-green-600">
              <CheckCircle2 size={16} />
              <span>Ready to Redeem</span>
            </div>
          )}

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
            space-y-3
          "
        >

          <button
            disabled={!isEligible || redeemMutation.isPending}
            onClick={handleRedeem}
            className={`w-full rounded-2xl py-4 text-lg font-bold text-white transition-colors ${
              isEligible && !redeemMutation.isPending
                ? "bg-[#bda752] hover:bg-[#a8913f] active:scale-[0.98]"
                : "cursor-not-allowed bg-gray-300"
            }`}
          >
            {redeemMutation.isPending ? "Processing..."
              : isExpired ? "Expired"
              : reward.stock === 0 ? "Out of Stock"
              : !eligibility?.eligible ? "Redeem"
              : "Redeem"}
          </button>

          <Link
            to={`/reward-store/${reward.slug}`}
            onClick={() => onOpenChange(false)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            <ExternalLink size={16} />
            View Full Details
          </Link>

        </div>

      </div>
    </BottomSheet>
  );
}
