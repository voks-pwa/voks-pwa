import type { RewardAggregate } from "../types/rewardAggregate";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

interface Props {
  reward: RewardAggregate;
  onClick: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  physical: "bg-blue-100 text-blue-700",
  voucher: "bg-purple-100 text-purple-700",
  coupon: "bg-pink-100 text-pink-700",
  digital: "bg-cyan-100 text-cyan-700",
  merchandise: "bg-orange-100 text-orange-700",
  event: "bg-indigo-100 text-indigo-700",
};

function categoryColor(type: string) {
  return CATEGORY_COLORS[type.toLowerCase()] ?? "bg-gray-100 text-gray-700";
}

const isExpired = (reward: RewardAggregate) =>
  reward.expired_at ? new Date(reward.expired_at) < new Date() : false;

export function RewardCard({
  reward,
  onClick,
}: Props) {
  const expired = isExpired(reward);
  const imageSrc = reward.image_url || "/placeholder.svg";

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className={`
        cursor-pointer
        rounded-3xl
        bg-white
        shadow-sm
        border
        ${expired ? "border-gray-200 opacity-60" : "border-gray-100"}
        overflow-hidden
        transition
        active:scale-[0.98]
      `}
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#5d5b3d] via-[#887845] to-[#bda752]">

        <OptimizedImage
          src={imageSrc}
          alt={reward.name}
          className="h-full w-full object-cover"
        />

        {expired && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-xl bg-black/60 px-4 py-2 text-lg font-bold text-white">
              Expired
            </span>
          </div>
        )}

        <div className="absolute left-4 top-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${categoryColor(reward.delivery_type)}`}
          >
            {reward.delivery_type}
          </span>
        </div>

        <div className="absolute right-4 top-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${expired ? "bg-gray-200 text-gray-600" : "bg-green-100 text-green-700"}`}
          >
            {reward.sponsor || (reward.reward_active ? "Available" : "Inactive")}
          </span>
        </div>

      </div>

      <div className="p-5">

        <h3 className={`text-lg font-bold ${expired ? "text-gray-400" : ""}`}>
          {reward.name}
        </h3>

        <p className="text-sm text-gray-500">
          {reward.subtitle}
        </p>

        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
          {reward.description}
        </p>

        <div className="mt-5 flex justify-between">

          <div>
            <p className="text-xs uppercase text-gray-400">
              Cost
            </p>
            <p className="font-black text-[#bda752]">
              {reward.cost} VXP
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase text-gray-400">
              Stock
            </p>
            <p className="font-bold">
              {reward.available}
            </p>
          </div>

        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          disabled={expired || reward.available <= 0}
          className={`mt-5 w-full rounded-2xl py-3 font-semibold text-white transition-colors ${
            expired || reward.available <= 0
              ? "cursor-not-allowed bg-gray-300"
              : "bg-[#bda752] hover:bg-[#a8913f]"
          }`}
        >
          {expired ? "Expired"
            : reward.available <= 0 ? "Out of Stock"
            : "View Details"}
        </button>

      </div>
    </div>
  );
}
