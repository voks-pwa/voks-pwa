import { RewardRow } from "./RewardRow";

interface RewardTableItem {
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
  rewards: RewardTableItem[];
  onEdit: (rewardId: number) => void;
}

export function RewardTable({
  rewards,
  onEdit,
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
              Cost
            </th>

            <th className="text-left">
              Stock
            </th>

            <th className="text-left">
              Priority
            </th>

            <th className="text-left">
              Type
            </th>

            <th className="text-left">
              Status
            </th>

            <th className="text-right pr-6">
              Manage
            </th>
          </tr>
        </thead>

        <tbody>
          {rewards.map((reward) => (
            <RewardRow
              key={reward.id}
              reward={reward}
              onEdit={onEdit}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
