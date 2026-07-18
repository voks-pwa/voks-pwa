import { AnalyticsBarChart } from "@/features/admin/analytics/components";
import type { RedeemTrendPoint } from "../types";

interface RedeemTrendChartProps {
  data: RedeemTrendPoint[];
  period: "daily" | "weekly" | "monthly";
}

export function RedeemTrendChart({ data, period }: RedeemTrendChartProps) {
  const label = period === "daily" ? "Daily" : period === "weekly" ? "Weekly" : "Monthly";

  return (
    <AnalyticsBarChart
      data={data as unknown as Record<string, unknown>[]}
      title={`${label} Redeem Trend`}
      bars={[{ dataKey: "redeems", fill: "#bda752", name: "Redeems" }]}
    />
  );
}
