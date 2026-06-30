import { Gift, Package, Ticket } from "lucide-react";
import type { Reward } from "../rewardTypes";

interface Props {
  reward: Reward;
  onClick: () => void;
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

function badgeColor(status: string) {
  switch (status.toLowerCase()) {
    case "available":
      return "bg-green-100 text-green-700";

    case "limited":
      return "bg-orange-100 text-orange-700";

    case "expired":
      return "bg-gray-200 text-gray-600";

    default:
      return "bg-red-100 text-red-700";
  }
}

export function RewardCard({
  reward,
  onClick,
}: Props) {
  return (
    <div
  onClick={onClick}
  className="
    cursor-pointer
    rounded-3xl
    bg-white
    shadow-sm
    border
    border-gray-100
    overflow-hidden
    transition
    active:scale-[0.98]
  "
>
      <div className="relative h-48 overflow-hidden">

  {reward.image ? (

    <img
      src={reward.image}
      alt={reward.title}
      className="
        h-full
        w-full
        object-cover
      "
    />

  ) : (

    <div
      className="
        flex
        h-full
        items-center
        justify-center
        bg-gradient-to-br
        from-[#5d5b3d]
        via-[#887845]
        to-[#bda752]
        text-white
      "
    >
      {getIcon(reward.deliveryType)}
    </div>

  )}

  <div className="absolute right-4 top-4">

    <span
      className={`
        rounded-full
        px-3
        py-1
        text-xs
        font-bold
        ${badgeColor(reward.status)}
      `}
    >
      {reward.badge ?? reward.status}
    </span>

  </div>

</div>

      <div className="p-5">

        <h3 className="text-lg font-bold">
          {reward.title}
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
              {reward.stock}
            </p>
          </div>

        </div>

        <button
          className="
          mt-5
          w-full
          rounded-2xl
          bg-[#bda752]
          py-3
          font-semibold
          text-white
        "
        >
          Redeem
        </button>

      </div>
    </div>
  );
}