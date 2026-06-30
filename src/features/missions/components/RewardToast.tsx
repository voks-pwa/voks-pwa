import { Trophy } from "lucide-react";
import { RewardBadge } from "./RewardBadge";

interface RewardToastProps {
  mission: string;
  reward: number;
  progress: number;
  target: number;
}

export function RewardToast({
  mission,
  reward,
  progress,
  target,
}: RewardToastProps) {
  return (
    <div className="w-90 rounded-2xl bg-white shadow-2xl border border-yellow-200 overflow-hidden">

      <div className="bg-linear-to-r from-yellow-400 to-orange-500 p-4 text-white">

        <div className="flex items-center gap-3">

          <Trophy size={28} />

          <div>

            <h2 className="font-bold text-lg">
              Mission Complete
            </h2>

            <p className="text-sm opacity-90">
              Congratulations 🎉
            </p>

          </div>

        </div>

      </div>

      <div className="space-y-4 p-5">

        <div>

          <p className="text-gray-500 text-sm">
            Completed Mission
          </p>

          <h3 className="font-semibold text-lg">
            {mission}
          </h3>

        </div>

        <RewardBadge reward={reward} />

        <div>

          <div className="flex justify-between text-xs mb-1">

            <span>Progress</span>

            <span>
              {progress}/{target}
            </span>

          </div>

          <div className="h-2 rounded-full bg-gray-200">

            <div
              className="h-2 rounded-full bg-green-500 transition-all"
              style={{
                width: `${Math.min(
                  (progress / target) * 100,
                  100
                )}%`,
              }}
            />

          </div>

        </div>

      </div>

    </div>
  );
}