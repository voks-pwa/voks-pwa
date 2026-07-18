import { Search } from "lucide-react";
import { useState } from "react";
import { useAdminCampaigns, useToggleFeatured, useUpdatePriority } from "../hooks/useAdminCampaigns";
import { exportToCSV } from "../../shared/AdminExportCSV";

const STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "running", label: "Live" },
  { value: "upcoming", label: "Upcoming" },
  { value: "ending_soon", label: "Ending Soon" },
  { value: "ended", label: "Ended" },
  { value: "archived", label: "Archived" },
  { value: "hidden", label: "Hidden" },
  { value: "inactive", label: "Inactive" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  running: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  upcoming: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  ending_soon: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  ended: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
  archived: { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
  hidden: { bg: "bg-gray-100", text: "text-gray-400", dot: "bg-gray-300" },
  inactive: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};

export function CampaignOverviewPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const toggleFeatured = useToggleFeatured();
  const updatePriority = useUpdatePriority();

  const { data, isLoading, error, refetch } = useAdminCampaigns({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: search || undefined,
    page,
    limit: 20,
  });

  const totalPages = Math.ceil((data?.total ?? 0) / 20);

  const handleExport = () => {
    const d = data;
    if (!d?.campaigns.length) return;
    const rows = d.campaigns.map((c) => ({
      ID: String(c.id),
      Slug: c.slug,
      Title: c.title,
      Sponsor: c.sponsor_name ?? "—",
      Status: c.status,
      Featured: c.featured ? "Yes" : "No",
      Priority: String(c.priority ?? 0),
      "Start Date": c.campaign_start ?? "—",
      "End Date": c.campaign_end ?? "—",
      Active: c.campaign_active ? "Yes" : "No",
    }));
    exportToCSV(rows as Record<string, unknown>[], {
      ID: "ID",
      Slug: "Slug",
      Title: "Title",
      Sponsor: "Sponsor",
      Status: "Status",
      Featured: "Featured",
      Priority: "Priority",
      "Start Date": "Start Date",
      "End Date": "End Date",
      Active: "Active",
    }, "campaigns-overview.csv");
  };

  if (isLoading && !data) {
    return (
      <div className="p-8 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse h-16 rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p className="mt-2">Failed to load campaigns</p>
        <button onClick={() => refetch()} className="mt-4 text-sm text-[#bda752] hover:underline">
          Retry
        </button>
      </div>
    );
  }

  const campaigns = data?.campaigns ?? [];

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black">Campaign Control Center</h1>
          <p className="text-gray-500">Monitor and moderate WordPress campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} disabled={!data?.campaigns.length} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50">
            Export CSV
          </button>
          <button onClick={() => refetch()} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            Sync WP
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            id="campaign-search"
            name="campaign-search"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm transition focus:border-[#bda752] focus:outline-none focus:ring-1 focus:ring-[#bda752]"
          />
        </div>
        <select
          id="campaign-status-filter"
          name="campaign-status-filter"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm transition focus:border-[#bda752] focus:outline-none focus:ring-1 focus:ring-[#bda752]"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Campaign</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Sponsor</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Featured</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <Search className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2">No campaigns found</p>
                </td>
              </tr>
            ) : (
              campaigns.map((campaign) => {
                const c = STATUS_COLORS[campaign.status] ?? STATUS_COLORS.hidden;
                return (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <a href={`/admin/campaigns/${campaign.slug}`} className="group">
                        <p className="font-semibold text-gray-900 group-hover:text-[#bda752]">{campaign.title}</p>
                        <p className="text-sm text-gray-500">{campaign.slug}</p>
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{campaign.sponsor_name ?? "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${c.bg} ${c.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span>
                        {campaign.campaign_start ? new Date(campaign.campaign_start).toLocaleDateString() : "—"}
                        {" → "}
                        {campaign.campaign_end ? new Date(campaign.campaign_end).toLocaleDateString() : "Ongoing"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <label htmlFor={`featured-${campaign.id}`} className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          id={`featured-${campaign.id}`}
                          name={`featured-${campaign.id}`}
                          type="checkbox"
                          checked={campaign.featured}
                          onChange={(e) => toggleFeatured.mutate({ slug: campaign.slug, featured: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-[#bda752] focus:ring-[#bda752]"
                        />
                        <span className="text-sm font-medium text-gray-700">Featured</span>
                      </label>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        id={`priority-${campaign.id}`}
                        name={`priority-${campaign.id}`}
                        value={campaign.priority}
                        onChange={(e) => updatePriority.mutate({ slug: campaign.slug, priority: Number(e.target.value) })}
                        className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm transition focus:border-[#bda752] focus:outline-none focus:ring-1 focus:ring-[#bda752]"
                      >
                        {[0, 1, 2, 3, 4, 5].map((p) => (
                          <option key={p} value={p}>{p === 0 ? "Normal" : `P${p}`}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`/admin/campaigns/${campaign.slug}`}
                        className="inline-block rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}