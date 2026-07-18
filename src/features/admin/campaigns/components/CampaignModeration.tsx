import { RefreshCw, AlertTriangle, CheckCircle2, Users, Target, Gift, Award, BarChart3, Database } from "lucide-react";
import { useState, useMemo } from "react";
import type { AdminCampaign } from "../types";
import { useToggleFeatured, useUpdatePriority, useSyncCampaign, useCampaignAnalytics, useCampaignMissions } from "../hooks/useAdminCampaigns";

const ACTIVE_LABEL = { label: "ACTIVE", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" };
const INACTIVE_LABEL = { label: "INACTIVE", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" };

function isActive(campaign: AdminCampaign): boolean {
  if (!campaign.campaign_active) return false;
  const now = new Date();
  const start = campaign.campaign_start ? new Date(campaign.campaign_start) : null;
  const end = campaign.campaign_end ? new Date(campaign.campaign_end) : null;
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <p className="mt-1 text-xl font-black text-gray-900">{value}</p>
    </div>
  );
}

export function CampaignModeration({ campaign, toggleFeatured, updatePriority }: { campaign: AdminCampaign; toggleFeatured: ReturnType<typeof useToggleFeatured>; updatePriority: ReturnType<typeof useUpdatePriority> }) {
  const [syncStatus, setSyncStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [priority, setPriority] = useState(campaign.priority ?? 0);
  const syncMutation = useSyncCampaign();
  const { data: missions } = useCampaignMissions(campaign.slug);
  const { data: analytics, refetch: refetchAnalytics } = useCampaignAnalytics(campaign.slug);

  const statusInfo = useMemo(() => isActive(campaign) ? ACTIVE_LABEL : INACTIVE_LABEL, [campaign]);

  const handleSync = async () => {
    const result = await syncMutation.mutateAsync(campaign.slug);
    setSyncStatus(result);
    setTimeout(() => setSyncStatus(null), 5000);
  };

  const handlePriorityChange = (newPriority: number) => {
    setPriority(newPriority);
    updatePriority.mutate({ slug: campaign.slug, priority: newPriority });
  };

  const handleFeaturedToggle = (featured: boolean) => {
    toggleFeatured.mutate({ slug: campaign.slug, featured });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Moderation Panel</h3>
          <p className="text-sm text-gray-500">Campaign monitoring — no editing (source: WordPress)</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetchAnalytics()} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            <BarChart3 className="h-4 w-4" />
            Refresh Statistics
          </button>
          <button onClick={handleSync} disabled={syncMutation.isPending} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
            {syncMutation.isPending ? "Syncing..." : "Refresh Cache"}
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className={`rounded-xl p-4 ${syncStatus.success ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
          <div className="flex items-center gap-3">
            {syncStatus.success ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <span className={syncStatus.success ? "text-emerald-700" : "text-red-700"}>
              {syncStatus.message}
            </span>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">Campaign Status</h4>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
            <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`} />
            {statusInfo.label}
          </span>
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-500">Campaign Active (WP)</p>
            <p className={`mt-1 font-bold ${campaign.campaign_active ? "text-emerald-700" : "text-red-700"}`}>
              {campaign.campaign_active ? "Yes" : "No"}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-500">Start Date</p>
            <p className="mt-1 font-bold text-gray-900">
              {campaign.campaign_start ? new Date(campaign.campaign_start).toLocaleDateString() : "—"}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-500">End Date</p>
            <p className="mt-1 font-bold text-gray-900">
              {campaign.campaign_end ? new Date(campaign.campaign_end).toLocaleDateString() : "Ongoing"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h4 className="mb-4 font-semibold text-gray-900">Campaign Statistics</h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MiniStat icon={Target} label="Mission Count" value={missions?.length ?? "—"} />
          <MiniStat icon={Users} label="Participants" value={analytics?.overview.participants ?? "—"} />
          <MiniStat icon={Award} label="Completion" value={analytics ? `${(analytics.overview.completion_rate * 100).toFixed(1)}%` : "—"} />
          <MiniStat icon={Gift} label="Reward Distributed" value={analytics?.overview.rewards_claimed ?? "—"} />
        </div>
        <div className="mt-4">
          <MiniStat icon={Database} label="XP Issued" value={analytics?.overview.avg_xp ? analytics.overview.avg_xp.toLocaleString() : "—"} />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h4 className="mb-4 font-semibold text-gray-900">Quick Actions</h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Featured Campaign</p>
            <p className="text-sm text-gray-500">Appears in hero banner on campaign list</p>
          </div>
          <label htmlFor="mod-featured" className="relative inline-flex items-center cursor-pointer">
            <input id="mod-featured" name="mod-featured" type="checkbox" checked={campaign.featured} onChange={(e) => handleFeaturedToggle(e.target.checked)} disabled={toggleFeatured.isPending} className="sr-only peer" />
            <div className="w-11 h-6 rounded-full border-2 border-gray-300 peer-focus:ring-2 peer-focus:ring-[#bda752] peer-focus:ring-offset-2 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-gray-300 after:transition-all peer-checked:bg-[#bda752] peer-checked:border-[#bda752]"></div>
          </label>
        </div>
        <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-4">
          <div>
            <p className="font-medium text-gray-900">Priority</p>
            <p className="text-sm text-gray-500">Higher = more prominent</p>
          </div>
          <select id="mod-priority" name="mod-priority" value={priority} onChange={(e) => handlePriorityChange(Number(e.target.value))} disabled={updatePriority.isPending} className="w-32 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition focus:border-[#bda752] focus:outline-none focus:ring-1 focus:ring-[#bda752]">
            {[0, 1, 2, 3, 4, 5].map((p) => (
              <option key={p} value={p}>{p === 0 ? "Normal" : `P${p}`}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}