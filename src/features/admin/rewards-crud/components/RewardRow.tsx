import { Gift } from "lucide-react";

import { RewardStatusBadge } from "./RewardStatusBadge";
import { RewardActionMenu } from "./RewardActionMenu";

interface RewardRowItem {
  id: number;
  title: string;
  subtitle: string;
  cost: number;
  stock: number;
  active: boolean;
  featured: boolean;
  priority: number;
  status: string;
}

interface Props {
  reward: RewardRowItem;
  onEdit: (rewardId: number) => void;
}

export function RewardRow({
  reward,
  onEdit,
}: Props) {
  return (
    <tr className="border-b last:border-none">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-[#bda752]/10
            "
          >
            <Gift
              size={18}
              className="text-[#bda752]"
            />
          </div>

          <div>
            <div className="font-semibold">
              {reward.title}
            </div>

            {reward.subtitle && (
              <span className="text-xs text-gray-500">
                {reward.subtitle}
              </span>
            )}
          </div>
        </div>
      </td>

      <td>
        <span className="font-semibold">
          {reward.cost} VXP
        </span>
      </td>

      <td>
        <span className="font-semibold">
          {reward.stock}
        </span>
      </td>

      <td>
        <span className="font-semibold">
          {reward.priority}
        </span>
      </td>

      <td>
        <span
          className="
            rounded-full
            bg-gray-100
            px-3
            py-1
            text-xs
            font-semibold
          "
        >
          {reward.featured
            ? "Featured"
            : "Standard"}
        </span>
      </td>

      <td>
        <RewardStatusBadge
          active={reward.active}
        />
      </td>

      <td className="pr-4 text-right">
        <RewardActionMenu
          rewardId={reward.id}
          onEdit={onEdit}
        />
      </td>
    </tr>
  );
}
