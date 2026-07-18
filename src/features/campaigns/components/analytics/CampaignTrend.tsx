import type { CampaignAnalytics } from "../../services/campaignAnalytics";

/**
 * Daily participation trend — read-only mini bar chart.
 */
export function CampaignTrend({ data }: { data: CampaignAnalytics }) {
  const points = data.dailyParticipation.slice(-14);
  const max = Math.max(1, ...points.map((p) => p.count));

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900">Daily Participation</h3>
      {points.length === 0 ? (
        <p className="mt-3 text-sm text-gray-400">No activity yet.</p>
      ) : (
        <div className="mt-4 flex h-28 items-end gap-1.5">
          {points.map((p) => (
            <div
              key={p.date}
              className="flex-1 rounded-t bg-[#bda752]/80"
              style={{ height: `${(p.count / max) * 100}%` }}
              title={`${p.date}: ${p.count}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
