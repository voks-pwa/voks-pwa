import type { RewardRedemption } from "../types";

import { RedemptionStatusBadge } from "./RedemptionStatusBadge";
import { RedemptionActionMenu } from "./RedemptionActionMenu";

interface Props {
  redemption: RewardRedemption;
}

export function RedemptionRow({
  redemption,
}: Props) {
  return (
    <tr className="border-b last:border-none hover:bg-gray-50 transition-colors">

      <td className="p-4 font-semibold">
        {redemption.reward_name}
      </td>

      <td className="p-4">
        <div className="flex flex-col">

          <span className="font-medium">
            {redemption.profile?.display_name ??
              redemption.user_id.slice(0, 8)}
          </span>

          <span className="text-xs text-gray-500">
            {redemption.profile?.email ?? ""}
          </span>

        </div>
      </td>

      <td className="p-4 font-semibold">
        {redemption.reward_cost} VXP
      </td>

      <td className="p-4">
        <RedemptionStatusBadge
          status={redemption.reward_status}
        />
      </td>

      <td className="p-4 text-sm text-gray-500">
        {new Date(
          redemption.redeemed_at
        ).toLocaleString()}
      </td>

      <td className="p-4">
        <RedemptionActionMenu
          redemptionId={redemption.id}
          status={redemption.reward_status}
        />
      </td>

    </tr>
  );
}