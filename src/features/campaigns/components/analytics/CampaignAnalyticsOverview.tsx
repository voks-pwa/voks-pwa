import type { CampaignAnalytics } from "../../services/campaignAnalytics";

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function Kpi({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

/**
 * Sponsor analytics overview — read-only KPI cards.
 * All values are aggregated server-side from Mission Engine data.
 */
export function CampaignAnalyticsOverview({
  data,
}: {
  data: CampaignAnalytics;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <Kpi label="Participants" value={data.participants} />
      <Kpi
        label="Completion Rate"
        value={pct(data.completionRate)}
        sub={`${data.completedParticipants} finished`}
      />
      <Kpi label="Reward Claimed" value={data.rewardClaimed} />
      <Kpi
        label="Avg Missions"
        value={data.avgMissionsCompleted.toFixed(1)}
        sub={`of ${data.missionCount}`}
      />
      <Kpi label="Referrals" value={data.referrals} />
      <Kpi
        label="Join Rate"
        value={data.participants > 0 ? "100%" : "—"}
        sub="exposed to missions"
      />
      <Kpi label="Missions" value={data.missionCount} />
      <Kpi label="Top City" value={data.audience.cities[0]?.key ?? "—"} />
    </div>
  );
}
