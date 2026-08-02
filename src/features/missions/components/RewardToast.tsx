import { Trophy, X } from "lucide-react";
import { RewardBadge } from "./RewardBadge";

interface RewardToastProps {
  mission: string;
  reward: number;
  onDismiss: () => void;
}

export function RewardToast({
  mission,
  reward,
  onDismiss,
}: RewardToastProps) {
  return (
    <div className="w-72 rounded-2xl bg-white shadow-lg border border-gray-100 border-l-4 border-l-[#bda752] overflow-hidden">

      <div className="relative p-4">

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute right-3 top-3 rounded-full p-1 text-gray-300 transition hover:bg-gray-100 hover:text-gray-500"
        >
          <X size={14} />
        </button>

        <div className="flex items-start gap-3">

          <Trophy size={20} className="mt-0.5 shrink-0 text-[#bda752]" />

          <div className="min-w-0">

            <h3 className="font-bold text-gray-900">{mission}</h3>

            <p className="mt-1 text-xs text-gray-400">Mission completed</p>

            <div className="mt-2">
              <RewardBadge reward={reward} />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
