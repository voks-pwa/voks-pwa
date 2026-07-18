import { Lightbulb, TrendingUp, Clock, Globe, Monitor } from "lucide-react";

import type { AnalyticsResponse } from "../types/analytics";

interface AnalyticsInsightsCardProps {
  data: AnalyticsResponse | undefined;
  isLoading: boolean;
}

interface Insight {
  icon: typeof Lightbulb;
  label: string;
  value: string;
  color: string;
}

export function AnalyticsInsightsCard({ data, isLoading }: AnalyticsInsightsCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-black">
          <Lightbulb size={20} className="text-[#bda752]" />
          Executive Insights
        </h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const insights: Insight[] = [];

  const avgMinutes = data.totals?.avgListeningMinutes;
  if (avgMinutes !== undefined && avgMinutes > 0) {
    insights.push({
      icon: Clock,
      label: "Avg Listening Time",
      value: `${avgMinutes} min`,
      color: "text-blue-600",
    });
  }

  const peakToday = data.totals?.peakToday;
  if (peakToday !== undefined && peakToday > 0) {
    insights.push({
      icon: TrendingUp,
      label: "Peak Today",
              value: (peakToday ?? 0).toLocaleString(),
      color: "text-green-600",
    });
  }

  const devices = data.devices;
  if (devices && Object.keys(devices).length > 0) {
    const topDevice = Object.entries(devices).sort(([, a], [, b]) => b - a)[0];
    insights.push({
      icon: Monitor,
      label: "Most Popular Device",
      value: topDevice[0],
      color: "text-purple-600",
    });
  }

  const sources = data.listenerSources;
  if (sources && Object.keys(sources).length > 0) {
    const topSource = Object.entries(sources).sort(([, a], [, b]) => b - a)[0];
    insights.push({
      icon: Globe,
      label: "Top Source",
      value: topSource[0],
      color: "text-amber-600",
    });
  }

  const countries = data.countries;
  if (countries && Object.keys(countries).length > 0) {
    const topCountry = Object.entries(countries).sort(([, a], [, b]) => b - a)[0];
    insights.push({
      icon: Globe,
      label: "Top Country",
      value: topCountry[0],
      color: "text-teal-600",
    });
  }

  if (!insights.length) return null;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-black">
        <Lightbulb size={20} className="text-[#bda752]" />
        Executive Insights
      </h3>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <div key={insight.label} className="rounded-2xl bg-gray-50 p-4">
              <Icon size={22} className={insight.color} />
              <p className="mt-2 text-xs text-gray-500">{insight.label}</p>
              <p className="mt-1 text-2xl font-black text-gray-800">{insight.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
