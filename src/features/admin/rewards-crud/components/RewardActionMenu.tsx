import { Pencil } from "lucide-react";

interface Props {
  rewardId: number;
  onEdit: (rewardId: number) => void;
}

export function RewardActionMenu({
  rewardId,
  onEdit,
}: Props) {
  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={() => onEdit(rewardId)}
        className="
          rounded-xl
          border
          border-gray-200
          p-2
          hover:bg-gray-100
        "
      >
        <Pencil size={16} />
      </button>
    </div>
  );
}
