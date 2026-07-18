import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getAnalytics } from "../repositories/analyticsRepository";
import { buildChartData, buildBroadcastTrend, buildListenerTrend } from "../services/analyticsService";
import { analyticsKeys } from "../queries/analyticsQueries";

export function useAnalytics(days: number = 30) {
  const query = useQuery({
    queryKey: analyticsKeys.byDays(days),
    queryFn: () => getAnalytics(days),
    staleTime: 60_000,
    refetchInterval: 30_000,
  });

  const chartData = useMemo(
    () => buildChartData(query.data?.trends),
    [query.data]
  );

  const broadcastChartData = useMemo(
    () => buildBroadcastTrend(query.data?.broadcastTrend),
    [query.data]
  );

  const listenerChartData = useMemo(
    () => buildListenerTrend(query.data?.listenerTrend),
    [query.data]
  );

  return {
    ...query,
    totals: query.data?.totals ?? null,
    wordpress: query.data?.wordpress ?? null,
    broadcasts: query.data?.broadcasts ?? null,
    notifications: query.data?.notifications ?? null,
    rewardBreakdown: query.data?.rewardBreakdown ?? null,
    missionBreakdown: query.data?.missionBreakdown ?? null,
    demographics: query.data?.demographics ?? null,
    devices: query.data?.devices ?? null,
    browsers: query.data?.browsers ?? null,
    platforms: query.data?.platforms ?? null,
    azuracast: query.data?.azuracast ?? null,
    chartData,
    broadcastChartData,
    listenerChartData,
  };
}
