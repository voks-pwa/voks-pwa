import { lazy, Suspense } from "react";
import type { RedeemTrendPoint } from "../types";

const AnalyticsBarChart = lazy(() =>
  import("@/features/admin/analytics/components/AnalyticsBarChart").then(m => ({
    default: m.AnalyticsBarChart,
  })),
);

interface RedeemTrendChartProps {
  data: RedeemTrendPoint[];
  period: "daily" | "weekly" | "monthly";
}

export function RedeemTrendChart({ data, period }: RedeemTrendChartProps) {
  const label = period === "daily" ? "Daily" : period === "weekly" ? "Weekly" : "Monthly";

  return (
    <Suspense fallback={<div className="h-[300px] animate-pulse rounded-3xl bg-gray-100" />}>
      <AnalyticsBarChart
        data={data as unknown as Record<string, unknown>[]}
        title={`${label} Redeem Trend`}
        bars={[{ dataKey: "redeems", fill: "#bda752", name: "Redeems" }]}
      />
    </Suspense>
  );
}
