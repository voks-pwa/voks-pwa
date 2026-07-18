import type { CampaignAnalytics } from "../../services/campaignAnalytics";

function Breakdown({
  title,
  items,
}: {
  title: string;
  items: Array<{ key: string; value: number }>;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {title}
      </h4>
      {items.length === 0 ? (
        <p className="text-sm text-gray-300">—</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <span className="w-24 shrink-0 truncate text-xs text-gray-600">
                {item.key}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[#bda752]/70"
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs font-semibold text-gray-500">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Audience breakdown — provinces / cities / gender.
 * Read-only demographics from participant profiles.
 */
export function CampaignAudience({ data }: { data: CampaignAnalytics }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900">Audience</h3>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Breakdown title="Provinces" items={data.audience.provinces} />
        <Breakdown title="Cities" items={data.audience.cities} />
        <Breakdown title="Gender" items={data.audience.gender} />
      </div>
    </section>
  );
}
