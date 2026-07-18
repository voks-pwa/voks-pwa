import { TrendingUp, Users, Target, Gift, Award, BarChart3 } from "lucide-react";
import { useCampaignAnalytics } from "../hooks/useAdminCampaigns";

interface CampaignAnalyticsViewProps {
  campaignSlug: string;
}

export function CampaignAnalyticsView({ campaignSlug }: CampaignAnalyticsViewProps) {
  const { data, isLoading, error } = useCampaignAnalytics(campaignSlug);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl bg-gray-50 p-5" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl bg-gray-50 p-8 text-center text-gray-500">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-2">No analytics data available</p>
      </div>
    );
  }

  const { overview, funnel, top_missions, daily_trend, audience } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Participants" value={overview.participants} gradient="from-blue-500 to-blue-600" />
        <StatCard icon={TrendingUp} label="Completion Rate" value={`${overview.completion_rate.toFixed(1)}%`} gradient="from-emerald-500 to-green-600" />
        <StatCard icon={Target} label="Avg XP" value={overview.avg_xp} gradient="from-amber-500 to-yellow-600" />
        <StatCard icon={Gift} label="Rewards Claimed" value={overview.rewards_claimed} gradient="from-pink-500 to-pink-600" />
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h4 className="mb-4 font-semibold text-gray-900">Completion Funnel</h4>
        <div className="space-y-3">
          {funnel.map((stage, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="w-32 shrink-0 text-sm font-medium text-gray-700">{stage.stage}</span>
              <div className="flex-1 h-3 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-[#bda752] transition-all duration-500" style={{ width: `${stage.rate}%` }} />
              </div>
              <span className="w-20 shrink-0 text-right text-sm font-bold text-gray-900">{stage.count}</span>
              <span className="w-16 shrink-0 text-right text-sm text-gray-500">{stage.rate.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h4 className="mb-4 font-semibold text-gray-900">Top Missions</h4>
          {top_missions.length === 0 ? (
            <p className="text-gray-500">No mission data</p>
          ) : (
            <div className="space-y-3">
              {top_missions.map((m, i) => (
                <div key={m.mission_id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                    <Award className="h-4 w-4 text-[#bda752]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-800">{m.title}</p>
                    <p className="text-xs text-gray-400">{m.completions} completions</p>
                  </div>
                  <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h4 className="mb-4 font-semibold text-gray-900">Daily Participation</h4>
          {daily_trend.length === 0 ? (
            <p className="text-gray-500">No trend data</p>
          ) : (
            <div className="h-48 flex items-end gap-1">
              {daily_trend.slice(-14).map((d) => (
                <div key={d.date} className="flex-1 rounded-t bg-[#bda752]/80" style={{ height: `${Math.max(4, (d.participants / Math.max(1, Math.max(...daily_trend.map(t => t.participants)))) * 100)}%` }} title={`${d.date}: ${d.participants}`} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h4 className="mb-4 font-semibold text-gray-900">Audience</h4>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h5 className="mb-2 text-sm font-semibold text-gray-700">Top Countries</h5>
            {audience.countries.length === 0 ? (
              <p className="text-sm text-gray-400">No country data</p>
            ) : (
              <div className="space-y-2">
                {audience.countries.slice(0, 5).map((c) => (
                  <div key={c.country} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{c.country}</span>
                    <span className="text-sm font-bold text-gray-900">{c.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h5 className="mb-2 text-sm font-semibold text-gray-700">Devices</h5>
            {audience.devices.length === 0 ? (
              <p className="text-sm text-gray-400">No device data</p>
            ) : (
              <div className="space-y-2">
                {audience.devices.slice(0, 5).map((d) => (
                  <div key={d.device} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{d.device}</span>
                    <span className="text-sm font-bold text-gray-900">{d.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, gradient }: { icon: typeof Users; label: string; value: string | number; gradient: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${gradient}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
    </div>
  );
}