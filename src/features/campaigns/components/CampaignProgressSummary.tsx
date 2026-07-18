import { Gift, Trophy } from "lucide-react";
import type { CampaignMissionState } from "../hooks/useCampaignMissions";

/**
 * Campaign Progress Summary — read-only progress display.
 * "Estimated VXP" / completion % come from Campaign's grouped missions and
 * the Mission Engine's progress. Campaign never calculates XP itself.
 */
export function CampaignProgressSummary({
  state,
}: {
  state: CampaignMissionState;
}) {
  const pct = Math.round(state.completionRatio * 100);

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Campaign Progress
        </h3>
        <span className="text-sm font-black text-[#bda752]">{pct}%</span>
      </div>

      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-[#bda752] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="flex flex-col">
          <span className="inline-flex items-center gap-1 text-lg font-black text-gray-900">
            <Trophy size={16} className="text-[#bda752]" />
            {state.completed}/{state.total}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
            Done
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black text-gray-900">
            {state.remaining}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
            Remaining
          </span>
        </div>
        <div className="flex flex-col">
          <span className="inline-flex items-center gap-1 text-lg font-black text-[#bda752]">
            <Gift size={16} />
            {state.totalVxp}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
            Est. VXP
          </span>
        </div>
      </div>
    </section>
  );
}
