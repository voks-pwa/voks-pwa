import { lazy, Suspense } from "react";

const AnalyticsPieChart = lazy(() =>
  import("@/features/admin/analytics/components/AnalyticsPieChart").then(m => ({
    default: m.AnalyticsPieChart,
  })),
);

interface StatusBreakdownPieProps {
  data: Record<string, number>;
}

const STATUS_COLORS = [
  "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#6b7280", "#3b82f6", "#ec4899",
];

export function StatusBreakdownPie({ data }: StatusBreakdownPieProps) {
  return (
    <Suspense fallback={<div className="h-[280px] animate-pulse rounded-3xl bg-gray-100" />}>
      <AnalyticsPieChart
        title="Redeem Status Breakdown"
        data={data}
        colors={STATUS_COLORS}
      />
    </Suspense>
  );
}
