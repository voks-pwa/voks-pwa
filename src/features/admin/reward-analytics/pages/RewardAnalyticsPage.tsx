import { useState } from "react";
import { RefreshCw, Download } from "lucide-react";
import {
  AnalyticsSkeleton,
  AnalyticsErrorState,
  PeriodFilter,
} from "@/features/admin/analytics/components";
import { useRewardAnalytics } from "../hooks/useRewardAnalytics";
import { OverviewCards } from "../components/OverviewCards";
import { RedeemTrendChart } from "../components/RedeemTrendChart";
import { TopRewardsTable } from "../components/TopRewardsTable";
import { LowStockAlert } from "../components/LowStockAlert";
import { StatusBreakdownPie } from "../components/StatusBreakdownPie";
import { VoucherBreakdownPie } from "../components/VoucherBreakdownPie";

const PERIOD_OPTIONS = [
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "90 Days", value: 90 },
];

function exportCSV(data: { date: string; redeems: number }[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]) as (keyof typeof data[0])[];
  const rows = data.map((row) => headers.map((h) => String(row[h] ?? "")).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function RewardAnalyticsPage() {
  const [period, setPeriod] = useState(30);

  const {
    isLoading,
    isError,
    error,
    refetch,
    redeems,
    wallet,
    inventory,
    vouchers,
    shipping,
    redeemTrend,
    walletBurnTrend,
    topRewards,
    lowStockItems,
    statusBreakdown,
    voucherBreakdown,
  } = useRewardAnalytics(Number(period));

  if (isLoading) return <AnalyticsSkeleton count={6} />;

  if (isError) {
    return (
      <AnalyticsErrorState
        message={error instanceof Error ? error.message : "Failed to load reward analytics"}
        onRetry={refetch}
      />
    );
  }

  const handleExport = () => {
    if (!redeemTrend.length) return;
    exportCSV(redeemTrend, `reward-redeem-trend-${period}d.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reward Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of redeem, wallet, inventory, voucher, and shipping metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PeriodFilter
            options={PERIOD_OPTIONS}
            selected={period}
            onChange={setPeriod}
          />
          <button
            onClick={handleExport}
            disabled={redeemTrend.length === 0}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <Download size={16} />
            CSV
          </button>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <OverviewCards
        totalRedeems={redeems?.total ?? 0}
        totalBurnedVxp={wallet?.totalVxpRedeemed ?? 0}
        inventoryCount={inventory?.totalItems ?? 0}
        voucherUsagePct={vouchers?.usagePct ?? 0}
        pendingShipment={shipping?.packingQueue ?? 0}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RedeemTrendChart data={redeemTrend} period={period <= 7 ? "daily" : period <= 30 ? "weekly" : "monthly"} />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <StatusBreakdownPie data={statusBreakdown} />
          <VoucherBreakdownPie data={voucherBreakdown} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopRewardsTable rows={topRewards} />
        </div>
        <LowStockAlert items={lowStockItems} />
      </div>

      {/* Inventory Movement / Wallet Burn Trend Section */}
      {walletBurnTrend.length > 0 && (
        <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">VXP Burn Trend</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">VXP Burned</th>
                </tr>
              </thead>
              <tbody>
                {walletBurnTrend.slice(-30).map((row) => (
                  <tr key={row.date} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 text-gray-600">{row.date}</td>
                    <td className="py-2 font-semibold text-amber-700">{row.vxp.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
