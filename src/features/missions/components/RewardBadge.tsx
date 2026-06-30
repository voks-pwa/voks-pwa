import { Gift } from "lucide-react";

interface RewardBadgeProps {
  reward: number;
}

export function RewardBadge({
  reward,
}: RewardBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-yellow-700 font-semibold shadow-sm">
      <Gift size={18} />
      +{reward} VXP
    </div>
  );
}