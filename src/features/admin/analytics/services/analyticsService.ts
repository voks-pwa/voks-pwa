import type {
  AnalyticsTrends,
  ChartDataPoint,
  BroadcastTrendPoint,
  ListenerTrendPoint,
} from "../types/analytics";

export function buildChartData(trends?: AnalyticsTrends): ChartDataPoint[] {
  if (!trends) return [];

  const allDates = new Set([
    ...Object.keys(trends.users),
    ...Object.keys(trends.xp),
    ...Object.keys(trends.missions),
    ...Object.keys(trends.redemptions),
  ]);

  return Array.from(allDates)
    .sort()
    .map((date) => ({
      date,
      users: trends.users[date] ?? 0,
      xp: trends.xp[date] ?? 0,
      missions: trends.missions[date] ?? 0,
      redemptions: trends.redemptions[date] ?? 0,
    }));
}

export function buildBroadcastTrend(data?: Record<string, { sent: number; pending: number }>): BroadcastTrendPoint[] {
  if (!data) return [];

  return Object.entries(data)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({
      date,
      sent: counts.sent,
      pending: counts.pending,
    }));
}

export function buildListenerTrend(data?: Record<string, number>): ListenerTrendPoint[] {
  if (!data) return [];

  return Object.entries(data)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date,
      listeners: count,
    }));
}
