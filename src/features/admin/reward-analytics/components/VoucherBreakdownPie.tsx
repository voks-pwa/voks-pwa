import { AnalyticsPieChart } from "@/features/admin/analytics/components";

interface VoucherBreakdownPieProps {
  data: Record<string, number>;
}

const VOUCHER_COLORS = ["#10b981", "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444"];

export function VoucherBreakdownPie({ data }: VoucherBreakdownPieProps) {
  return (
    <AnalyticsPieChart
      title="Voucher Status Breakdown"
      data={data}
      colors={VOUCHER_COLORS}
    />
  );
}
