import { Trophy } from "lucide-react";
import type { CampaignAnalytics } from "../../services/campaignAnalytics";

/**
 * Top missions by completion count. Mission ids are resolved to titles
 * client-side where possible; falls back to the mission id label.
 */
export function CampaignTopMissions({
  data,
  missionTitles,
}: {
  data: CampaignAnalytics;
  missionTitles?: Map<string, string>;
}) {
  const items = data.topMissions;

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900">Top Missions</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-gray-400">No completions yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item, i) => (
            <div
              key={item.key}
              className="flex items-center gap-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                <Trophy size={16} className="text-[#bda752]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {missionTitles?.get(item.key) ??
                    `Mission #${item.key}`}
                </p>
                <p className="text-xs text-gray-400">
                  {item.value} completions
                </p>
              </div>
              <span className="text-xs font-bold text-gray-400">
                #{i + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
