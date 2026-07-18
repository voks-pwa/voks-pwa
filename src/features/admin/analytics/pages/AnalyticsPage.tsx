import { useState } from "react";
import {
  AlertCircle,
  RefreshCw,
  Users,
  Star,
  Target,
  Gift,
  Headphones,
  Radio,
  Bell,
  Award,
  BadgeCheck,
  Podcast,
  Megaphone,
  Clock,
  TrendingUp,
  ListMusic,
} from "lucide-react";

import { useAnalytics } from "../hooks/useAnalytics";
import type { AnalyticsTotals } from "../types/analytics";
import { exportToCSV } from "../../shared/AdminExportCSV";
import { exportToExcel } from "../../shared/AdminExportExcel";

import {
  PeriodFilter,
  StatCard,
  AnalyticsBarChart,
  AnalyticsSkeleton,
  AnalyticsEmptyState,
  AnalyticsErrorState,
  AnalyticsPieChart,
  AnalyticsListenerCard,
  AnalyticsLineChart,
  AnalyticsLiveBroadcast,
  AnalyticsListenerTable,
  AnalyticsInsightsCard,
} from "../components";

const PERIODS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

interface CardConfig {
  title: string;
  dataKey: string;
  gradient: string;
  icon: typeof Users;
}

const CORE_CARDS: CardConfig[] = [
  { title: "Total Users", dataKey: "users", icon: Users, gradient: "from-blue-500 to-blue-600" },
  { title: "Transactions", dataKey: "transactions", icon: Star, gradient: "from-orange-500 to-yellow-600" },
  { title: "Completions", dataKey: "missions", icon: Target, gradient: "from-green-500 to-green-600" },
  { title: "Redemptions", dataKey: "redemptions", icon: Gift, gradient: "from-pink-500 to-pink-600" },
];

const BROADCAST_CARDS: CardConfig[] = [
  { title: "Total Broadcasts", dataKey: "totalBroadcasts", icon: Radio, gradient: "from-amber-500 to-yellow-600" },
  { title: "Sent Broadcasts", dataKey: "sentBroadcasts", icon: Radio, gradient: "from-emerald-500 to-green-600" },
  { title: "Pending Broadcasts", dataKey: "pendingBroadcasts", icon: Clock, gradient: "from-rose-500 to-pink-600" },
];

const NOTIFICATION_CARDS: CardConfig[] = [
  { title: "Total Notifications", dataKey: "totalNotifications", icon: Bell, gradient: "from-fuchsia-500 to-pink-600" },
  { title: "Read Notifications", dataKey: "readNotifications", icon: Bell, gradient: "from-sky-500 to-cyan-600" },
  { title: "Unread Notifications", dataKey: "unreadNotifications", icon: Bell, gradient: "from-gray-500 to-slate-600" },
];

const ENGAGEMENT_CARDS: CardConfig[] = [
  { title: "Unique Completers", dataKey: "uniqueMissionCompleters", icon: BadgeCheck, gradient: "from-lime-500 to-green-600" },
  { title: "Unique Redeemers", dataKey: "uniqueRedeemers", icon: Award, gradient: "from-orange-500 to-red-600" },
  { title: "Podcasts Published", dataKey: "podcastCount", icon: Podcast, gradient: "from-teal-500 to-emerald-600" },
  { title: "Promos Running", dataKey: "promoCount", icon: Megaphone, gradient: "from-violet-500 to-purple-600" },
];

function SectionCards({ cards, totals }: { cards: CardConfig[]; totals: AnalyticsTotals | null }) {
  if (!totals) return null;
  return (
    <>
      {cards.map((config) => (
        <StatCard
          key={config.title}
          title={config.title}
          value={(totals as unknown as Record<string, number>)[config.dataKey] ?? 0}
          icon={config.icon}
          gradient={config.gradient}
        />
      ))}
    </>
  );
}

function CardSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100" />
      ))}
    </>
  );
}

function SectionGrid({ title, cards, totals, isLoading }: {
  title: string;
  cards: CardConfig[];
  totals: AnalyticsTotals | null;
  isLoading: boolean;
}) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-800">{title}</h2>
      <div className="grid gap-5 md:grid-cols-3">
        {isLoading && !totals ? <CardSkeleton count={cards.length} /> : <SectionCards cards={cards} totals={totals} />}
      </div>
    </div>
  );
}

function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <AlertCircle className="h-5 w-5 shrink-0" />
      <span className="flex-1">{message}</span>
      <button
        onClick={onRetry}
        className="flex shrink-0 items-center gap-1.5 rounded-md bg-red-100 px-3 py-1.5 font-medium text-red-700 transition hover:bg-red-200"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </button>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub }: {
  icon: typeof Headphones;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100">
          <Icon size={20} className="text-gray-600" />
        </div>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <p className="text-3xl font-black text-gray-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export function AnalyticsPage() {
  const [days, setDays] = useState(30);

  const {
    totals,
    chartData,
    broadcastChartData,
    listenerChartData,
    isLoading,
    error,
    refetch,
    data,
  } = useAnalytics(days);

  const getExportData = () => {
    if (!chartData.length) return null;
    const rows = chartData.map((d) => ({ ...d }));
    const headers: Record<string, string> = {
      date: "Date",
      users: "New Users",
      missions: "Completions",
      redemptions: "Redemptions",
      xp: "XP Earned",
    };
    return { rows, headers };
  };

  const handleExportCSV = () => {
    const exportData = getExportData();
    if (!exportData) return;
    exportToCSV(exportData.rows as Record<string, unknown>[], exportData.headers, `analytics-${days}d.csv`);
  };

  const handleExportExcel = () => {
    const exportData = getExportData();
    if (!exportData) return;
    exportToExcel(exportData.rows as Record<string, unknown>[], exportData.headers, `analytics-${days}d.xls`);
  };

  if (isLoading && !totals) {
    return <AnalyticsSkeleton />;
  }

  if (error && !totals) {
    return (
      <AnalyticsErrorState
        message={error instanceof Error ? error.message : "An unexpected error occurred"}
        onRetry={() => refetch()}
      />
    );
  }

  const hasAnyData = !!(totals || chartData.length > 0 || data);

  if (!isLoading && !error && !hasAnyData) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black">Analytics</h1>
          <p className="text-gray-500">Overview of platform metrics</p>
        </div>
        <AnalyticsEmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Analytics</h1>
          <p className="text-gray-500">Overview of platform metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex overflow-hidden rounded-lg border border-gray-200">
            <button
              onClick={handleExportCSV}
              disabled={!chartData.length}
              className="border-r border-gray-200 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
            >
              CSV
            </button>
            <button
              onClick={handleExportExcel}
              disabled={!chartData.length}
              className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
            >
              Excel
            </button>
          </div>
          <PeriodFilter options={PERIODS} selected={days} onChange={setDays} />
        </div>
      </div>

      {/* Error banner */}
      {error && !isLoading && (
        <InlineError
          message={error instanceof Error ? error.message : "Failed to refresh analytics"}
          onRetry={() => refetch()}
        />
      )}

      {/* Section 1: Executive Overview KPIs */}
      {totals && (
        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-800">Executive Overview</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              icon={Headphones}
              label="Live Listeners"
              value={(totals.currentListeners ?? 0).toLocaleString()}
              sub={totals.peakToday ?? 0 > 0 ? `Peak today: ${totals.peakToday ?? 0}` : undefined}
            />
            <KpiCard
              icon={TrendingUp}
              label="Peak Today"
              value={(totals.peakToday ?? 0).toLocaleString()}
              sub="Highest concurrent listeners"
            />
            <KpiCard
              icon={Clock}
              label="Avg Listening Time"
              value={`${totals.avgListeningMinutes ?? 0} min`}
              sub="Per session average"
            />
            <KpiCard
              icon={ListMusic}
              label="Unique Listeners"
              value={(data?.azuracast?.uniqueCount ?? 0).toLocaleString()}
              sub="Total unique connections"
            />
          </div>
        </div>
      )}

      {/* Section 6: Live Broadcast */}
      <div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <AnalyticsLiveBroadcast
            nowplaying={data?.nowplaying ?? null}
            isLoading={isLoading}
          />
          {/* Section 2: Listening Trend (line chart) */}
          {listenerChartData.length > 0 && (
            <AnalyticsLineChart
              title="Listening Trend"
              data={listenerChartData as unknown as Record<string, unknown>[]}
              lines={[
                { dataKey: "listeners", color: "#8b5cf6", name: "Listeners" },
              ]}
            />
          )}
        </div>
      </div>

      {/* Core Metrics */}
      {totals && (
        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-800">Core Metrics</h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <SectionCards cards={CORE_CARDS} totals={totals} />
          </div>
        </div>
      )}

      {/* Broadcasts + Notifications */}
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionGrid title="Broadcasts" cards={BROADCAST_CARDS} totals={totals} isLoading={isLoading} />
        <SectionGrid title="Notifications" cards={NOTIFICATION_CARDS} totals={totals} isLoading={isLoading} />
      </div>

      {/* Engagement & Content */}
      {totals && (
        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-800">Engagement & Content</h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <SectionCards cards={ENGAGEMENT_CARDS} totals={totals} />
          </div>
        </div>
      )}

      {/* Trend charts */}
      {chartData.length > 0 && (
        <div className="grid gap-6 xl:grid-cols-2">
          <AnalyticsBarChart
            title="Users & Missions"
            data={chartData as unknown as Record<string, unknown>[]}
            bars={[
              { dataKey: "users", fill: "#3b82f6", name: "New Users" },
              { dataKey: "missions", fill: "#22c55e", name: "Completions" },
            ]}
          />
          <AnalyticsBarChart
            title="XP & Redemptions"
            data={chartData as unknown as Record<string, unknown>[]}
            bars={[
              { dataKey: "xp", fill: "#f59e0b", name: "XP Earned" },
              { dataKey: "redemptions", fill: "#ec4899", name: "Redemptions" },
            ]}
          />
        </div>
      )}

      {/* Broadcast trend */}
      {broadcastChartData.length > 0 && (
        <div>
          <AnalyticsBarChart
            title="Broadcast Trend"
            data={broadcastChartData as unknown as Record<string, unknown>[]}
            bars={[
              { dataKey: "sent", fill: "#22c55e", name: "Sent" },
              { dataKey: "pending", fill: "#f59e0b", name: "Pending" },
            ]}
          />
        </div>
      )}

      {/* Section 3: Listener Sources + Section 4: Geographic + Section 5: Device/Browser/OS pies */}
      {data && (
        <>
          <div className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-4">
            {data.listenerSources && Object.keys(data.listenerSources).length > 0 && (
              <AnalyticsPieChart title="Listener Sources" data={data.listenerSources} />
            )}
            {data.devices && Object.keys(data.devices).length > 0 && (
              <AnalyticsPieChart title="Devices" data={data.devices} />
            )}
            {data.browsers && Object.keys(data.browsers).length > 0 && (
              <AnalyticsPieChart title="Browsers" data={data.browsers} />
            )}
            {data.platforms && Object.keys(data.platforms).length > 0 && (
              <AnalyticsPieChart title="Platforms" data={data.platforms} />
            )}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {data.countries && Object.keys(data.countries).length > 0 && (
              <AnalyticsPieChart title="Country Distribution" data={data.countries} />
            )}
            {data.demographics?.genders && Object.keys(data.demographics.genders).length > 0 && (
              <AnalyticsPieChart title="Gender" data={data.demographics.genders} />
            )}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {data.demographics?.cities && Object.keys(data.demographics.cities).length > 0 && (
              <AnalyticsPieChart title="Top Cities" data={data.demographics.cities} />
            )}
            {data.demographics?.provinces && Object.keys(data.demographics.provinces).length > 0 && (
              <AnalyticsPieChart title="Top Provinces" data={data.demographics.provinces} />
            )}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {data.rewardBreakdown && Object.keys(data.rewardBreakdown).length > 0 && (
              <AnalyticsPieChart title="Reward Status Breakdown" data={data.rewardBreakdown} />
            )}
            {data.missionBreakdown && Object.keys(data.missionBreakdown).length > 0 && (
              <AnalyticsPieChart title="Mission Breakdown by Type" data={data.missionBreakdown} />
            )}
          </div>

          {/* AzuraCast Listener card */}
          <div>
            <AnalyticsListenerCard
              currentListeners={totals?.currentListeners ?? 0}
              totalListenedMinutes={totals?.totalListenedMinutes ?? 0}
              azuracastError={data.azuracast?.error ?? null}
            />
          </div>
        </>
      )}

      {/* Section 7: Active Listener Table */}
      <AnalyticsListenerTable
        azuracast={data?.azuracast ?? null}
        isLoading={isLoading}
      />

      {/* Section 8: Executive Insights */}
      <AnalyticsInsightsCard
        data={data}
        isLoading={isLoading}
      />
    </div>
  );
}
