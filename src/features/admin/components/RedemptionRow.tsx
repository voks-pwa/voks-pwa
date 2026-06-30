import type {
  RewardRedemption,
} from "../adminTypes";

import {
  RedemptionStatusBadge,
} from "./RedemptionStatusBadge";

import {
  RedemptionActionMenu,
} from "./RedemptionActionMenu";

interface Props {
  redemption: RewardRedemption;
}

export function RedemptionRow({
  redemption,
}: Props) {
  return (
    <tr className="border-b last:border-none">

      <td className="p-4 font-semibold">
        {redemption.reward_name}
      </td>

      <td>
        <span className="font-mono text-xs">
          {redemption.user_id.slice(0,8)}...
        </span>
      </td>

      <td>
        {redemption.reward_cost} VXP
      </td>

      <td>
        <RedemptionStatusBadge
          status={redemption.reward_status}
        />
      </td>

      <td className="text-gray-500 text-sm">
        {new Date(
          redemption.redeemed_at
        ).toLocaleDateString()}
      </td>

      <td className="px-4 py-4 text-right">

        <RedemptionActionMenu
            id={redemption.id}
        />

        </td>
      <th className="text-right">

        Action

         </th>

    </tr>
  );
}