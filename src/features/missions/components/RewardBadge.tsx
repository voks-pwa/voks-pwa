import { Gift } from "lucide-react";

interface RewardBadgeProps {
  reward: number;
}

export function RewardBadge({
  reward,
}: RewardBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-[#bda752]/10 px-4 py-2 text-[#bda752] font-semibold shadow-sm">
      <Gift size={18} />
      +{reward} VXP
    </div>
  );
}