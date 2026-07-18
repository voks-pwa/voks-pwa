import { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Gift,
  Coins,
  Calendar,
  AlertTriangle,
  Package,
  Ticket,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { useActiveRewardAggregate } from "@/features/rewards/hooks/useRewardAggregate";
import { useRewardEligibility } from "@/features/rewards/hooks/useRewardEligibility";
import { useRedeem } from "@/features/redeem/hooks/useRedeem";
import { showToast } from "@/components/ui/showToast";

import type { RewardAggregate } from "@/features/rewards/types/rewardAggregate";

function deliveryIcon(type: string) {
  switch (type) {
    case "digital":
      return <Ticket size={18} />;
    case "pickup":
    case "physical":
      return <Package size={18} />;
    default:
      return <Gift size={18} />;
  }
}

export function RewardDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: rewards = [], isLoading, isError } = useActiveRewardAggregate();

  const reward: RewardAggregate | null = useMemo(() => {
    if (!slug) return null;
    return rewards.find(
      (r) => r.slug.toLowerCase() === slug.toLowerCase()
    ) ?? null;
  }, [rewards, slug]);

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
    } else {
      showToast({ type: "error", title: "Failed to redeem", message: result.message });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#bda752]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400" />
        <p className="text-lg font-semibold text-gray-700">Failed to load rewards</p>
        <Link
          to="/reward-store"
          className="rounded-xl bg-[#bda752] px-6 py-2.5 text-sm font-semibold text-white"
        >
          Back to Reward Store
        </Link>
      </div>
    );
  }

  if (!reward) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
        <Gift className="h-12 w-12 text-gray-300" />
        <p className="text-lg font-semibold text-gray-700">Reward not found</p>
        <Link
          to="/reward-store"
          className="rounded-xl bg-[#bda752] px-6 py-2.5 text-sm font-semibold text-white"
        >
          Back to Reward Store
        </Link>
      </div>
    );
  }

  const isExpired = reward.expired_at
    ? new Date(reward.expired_at) < new Date()
    : false;

  const outOfStock = reward.stock <= 0;

  const isEligible = eligibility?.eligible === true && !isExpired && !outOfStock;

  return (
    <div className="mx-auto max-w-2xl">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-900"
      >
        <ArrowLeft size={18} /> Back
      </button>

      {/* Hero Image */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5d5b3d] via-[#887845] to-[#bda752]">
        {reward.image_url && (
          <img
            src={reward.image_url}
            alt={reward.name}
            className="h-64 w-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        )}

        {isExpired && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-xl bg-black/60 px-4 py-2 text-lg font-bold text-white">
              Expired
            </span>
          </div>
        )}

        {outOfStock && !isExpired && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-xl bg-black/60 px-4 py-2 text-lg font-bold text-white">
              Out of Stock
            </span>
          </div>
        )}

        {reward.featured && !isExpired && !outOfStock && (
          <div className="absolute right-4 top-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
              <Sparkles size={12} />
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Title & Subtitle */}
      <div className="mt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{reward.name}</h1>
            {reward.subtitle && (
              <p className="mt-1 text-gray-500">{reward.subtitle}</p>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 capitalize">
            {reward.delivery_type}
          </span>
        </div>
      </div>

      {/* Info Cards */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Coins size={14} />
            <span>Cost</span>
          </div>
          <p className="mt-1 text-sm font-bold text-[#bda752]">{reward.cost} VXP</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShoppingBag size={14} />
            <span>Stock</span>
          </div>
          <p className="mt-1 text-sm font-bold text-gray-800">{reward.stock}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {deliveryIcon(reward.delivery_type)}
            <span>Category</span>
          </div>
          <p className="mt-1 text-sm font-bold text-gray-800 capitalize">{reward.delivery_type}</p>
        </div>
        {reward.expired_at && (
          <div className="rounded-xl bg-gray-50 p-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar size={14} />
              <span>{isExpired ? "Expired" : "Expires"}</span>
            </div>
            <p className={`mt-1 text-sm font-bold ${isExpired ? "text-red-500" : "text-gray-800"}`}>
              {new Date(reward.expired_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        )}
      </div>

      {/* Validation badges */}
      {reward.campaign_slug && (
        <div className="mt-3 rounded-xl bg-gray-50 p-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Gift size={14} />
            <span>Campaign</span>
          </div>
          <p className="mt-1 text-sm font-bold text-gray-800">{reward.campaign_slug}</p>
        </div>
      )}

      {reward.required_badge && (
        <div className="mt-3 rounded-xl bg-gray-50 p-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Sparkles size={14} />
            <span>Required Badge</span>
          </div>
          <p className="mt-1 text-sm font-bold text-gray-800">{reward.required_badge}</p>
        </div>
      )}

      {reward.required_achievement && (
        <div className="mt-3 rounded-xl bg-gray-50 p-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Sparkles size={14} />
            <span>Required Achievement</span>
          </div>
          <p className="mt-1 text-sm font-bold text-gray-800">{reward.required_achievement}</p>
        </div>
      )}

      {reward.vip_only && (
        <div className="mt-3 rounded-xl bg-amber-50 p-3">
          <div className="flex items-center gap-2 text-xs text-amber-600">
            <Sparkles size={14} />
            <span>VIP Only</span>
          </div>
          <p className="mt-1 text-sm font-bold text-amber-700">This reward is exclusive to VIP members</p>
        </div>
      )}

      {/* Expired warning */}
      {isExpired && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-red-50 p-3 text-sm text-red-600">
          <AlertTriangle size={16} />
          <span>This reward has expired</span>
        </div>
      )}

      {/* Description */}
      {reward.description && (
        <div className="mt-6">
          <h3 className="text-sm font-bold text-gray-700">Description</h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
            {reward.description}
          </p>
        </div>
      )}

      {/* Terms */}
      {reward.terms && (
        <div className="mt-6">
          <h3 className="text-sm font-bold text-gray-700">Terms & Conditions</h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
            {reward.terms}
          </p>
        </div>
      )}

      {/* Delivery Notes */}
      {reward.delivery_notes && (
        <div className="mt-6">
          <h3 className="text-sm font-bold text-gray-700">Delivery</h3>
          <p className="mt-2 text-sm text-gray-600">{reward.delivery_notes}</p>
        </div>
      )}

      {/* Bonus VXP */}
      {reward.bonus_vxp > 0 && (
        <div className="mt-6 rounded-2xl bg-amber-50 p-4">
          <h3 className="text-sm font-bold">Bonus</h3>
          <p className="mt-2 text-sm">
            Redeem this reward to get a bonus of
            <span className="font-bold text-[#bda752]"> +{reward.bonus_vxp} VXP</span>
          </p>
        </div>
      )}

      {/* Eligibility Status */}
      <div className="mt-6">
        {checkingEligibility && (
          <div className="flex items-center gap-2 rounded-2xl bg-gray-50 p-3 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" />
            <span>Checking eligibility...</span>
          </div>
        )}

        {!checkingEligibility && eligibility && !eligibility.eligible && !isExpired && !outOfStock && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-3 text-sm text-red-600">
            <XCircle size={16} />
            <span>{eligibility.reason}</span>
          </div>
        )}

        {!checkingEligibility && eligibility && eligibility.eligible && !isExpired && !outOfStock && (
          <div className="flex items-center gap-2 rounded-2xl bg-green-50 p-3 text-sm text-green-600">
            <CheckCircle2 size={16} />
            <span>Ready to Redeem</span>
          </div>
        )}
      </div>

      {/* Redeem Button */}
      <div className="mt-4">
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
            : outOfStock ? "Out of Stock"
            : !eligibility?.eligible ? eligibility?.reason || "Redeem"
            : "Redeem"}
        </button>

        {!eligibility?.eligible && !isExpired && !outOfStock && (
          <p className="mt-2 text-center text-xs text-gray-400">
            {eligibility?.reason || "Not eligible to redeem"}
          </p>
        )}
      </div>

      <div className="h-8" />

    </div>
  );
}
