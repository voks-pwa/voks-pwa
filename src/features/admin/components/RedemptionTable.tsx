import type {
  RewardRedemption,
} from "../adminTypes";

import {
  RedemptionRow,
} from "./RedemptionRow";

interface Props {
  redemptions: RewardRedemption[];
}
export function RedemptionTable({
  redemptions,
}: Props) {

  return (

    <div
      className="
        overflow-hidden
        rounded-3xl
        bg-white
        shadow-sm
      "
    >

      <table className="w-full">

        <thead>

          <tr
            className="
              border-b
              bg-gray-50
            "
          >

            <th className="p-4 text-left">
              Reward
            </th>

            <th className="text-left">
              User
            </th>

            <th className="text-left">
              Cost
            </th>

            <th className="text-left">
              Status
            </th>

            <th className="text-left">
              Date
            </th>

          </tr>

        </thead>

        <tbody>

          {redemptions.map((item) => (

            <RedemptionRow
              key={item.id}
              redemption={item}
            />

          ))}

        </tbody>

      </table>

    </div>

  );

}