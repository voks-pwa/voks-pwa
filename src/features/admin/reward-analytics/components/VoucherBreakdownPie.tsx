import { lazy, Suspense } from "react";

const AnalyticsPieChart = lazy(() =>
  import("@/features/admin/analytics/components/AnalyticsPieChart").then(m => ({
    default: m.AnalyticsPieChart,
  })),
);

interface VoucherBreakdownPieProps {
  data: Record<string, number>;
}

const VOUCHER_COLORS = ["#10b981", "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444"];

export function VoucherBreakdownPie({ data }: VoucherBreakdownPieProps) {
  return (
    <Suspense fallback={<div className="h-[280px] animate-pulse rounded-3xl bg-gray-100" />}>
      <AnalyticsPieChart
        title="Voucher Status Breakdown"
        data={data}
        colors={VOUCHER_COLORS}
      />
    </Suspense>
  );
}
