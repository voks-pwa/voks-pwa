import { AnalyticsPieChart } from "@/features/admin/analytics/components";

interface StatusBreakdownPieProps {
  data: Record<string, number>;
}

const STATUS_COLORS = [
  "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#6b7280", "#3b82f6", "#ec4899",
];

export function StatusBreakdownPie({ data }: StatusBreakdownPieProps) {
  return (
    <AnalyticsPieChart
      title="Redeem Status Breakdown"
      data={data}
      colors={STATUS_COLORS}
    />
  );
}
