import type { CampaignAnalytics } from "../../services/campaignAnalytics";

function Bar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const ratio = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-600">{label}</span>
        <span className="font-bold text-gray-900">{value}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-[#bda752] transition-all duration-500"
          style={{ width: `${ratio}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Completion funnel — Participants → Started → Completed.
 * Read-only; derived from Mission Engine progress.
 */
export function CampaignCompletionFunnel({
  data,
}: {
  data: CampaignAnalytics;
}) {
  const { funnel } = data;

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900">Completion Funnel</h3>
      <div className="mt-4 space-y-4">
        <Bar label="Participants" value={funnel.participants} total={funnel.participants} />
        <Bar label="Started" value={funnel.started} total={funnel.participants} />
        <Bar
          label="Completed"
          value={funnel.completed}
          total={funnel.participants}
        />
      </div>
    </section>
  );
}
