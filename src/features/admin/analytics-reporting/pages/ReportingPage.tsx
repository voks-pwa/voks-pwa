import { useState } from "react";
import { Download, BarChart3 } from "lucide-react";
import { useWalletAnalytics, useCommerceKpis, useCampaignAnalytics } from "@/features/analytics";
import { useCommerceAnalytics } from "@/features/commerce";
import { useSubscriptionAnalytics } from "@/features/subscription";

const PERIODS = [7, 30, 90];
const SECTIONS = [
  { key: "overview", label: "Executive Overview" },
  { key: "wallet", label: "Wallet" },
  { key: "commerce", label: "Commerce" },
  { key: "subscription", label: "Subscription" },
  { key: "campaign", label: "Campaign" },
];

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const bom = "\uFEFF";
  const csv = bom + [
    headers.join(","),
    ...rows.map((r) => r.join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportingPage() {
  const [days, setDays] = useState(30);
  const [selectedSection, setSelectedSection] = useState("overview");

  const { data: wallet } = useWalletAnalytics(days);
  const { data: commerceKpis } = useCommerceKpis(days);
  const { data: campaign } = useCampaignAnalytics(days);
  const { data: subscriptionAnalytics } = useSubscriptionAnalytics();
  const { data: commerceAnalytics } = useCommerceAnalytics(days);

  const handleExportOverview = () => {
    downloadCsv(
      `voks-overview-${days}d.csv`,
      ["Metric", "Value"],
      [
        ["Period", `${days} days`],
        ["Wallet Minted", String(commerceKpis?.wallet_minted ?? 0)],
        ["Wallet Spent", String(commerceKpis?.wallet_spent ?? 0)],
        ["Revenue", String(commerceKpis?.revenue ?? 0)],
        ["Orders", String(commerceKpis?.orders ?? 0)],
        ["Fulfillments", String(commerceKpis?.fulfillments ?? 0)],
        ["Refunds", String(commerceKpis?.refunds ?? 0)],
        ["Active Subscriptions", String(commerceKpis?.active_subscriptions ?? 0)],
        ["Campaign Participants", String(commerceKpis?.campaign_participants ?? 0)],
        ["Wallet Minted (detail)", String(wallet?.minted ?? 0)],
        ["Wallet Spent (detail)", String(wallet?.spent ?? 0)],
        ["Wallet Net", String(wallet?.net ?? 0)],
        ["Wallet Transactions", String(wallet?.transactions ?? 0)],
        ["Active Wallets", String(wallet?.active_wallets ?? 0)],
        ["Total Campaigns", String(campaign?.total_campaigns ?? 0)],
        ["Active Campaigns", String(campaign?.active_campaigns ?? 0)],
        ["Rewards Granted", String(campaign?.rewards_granted ?? 0)],
        ["VXP Distributed (campaign)", String(campaign?.vxp_distributed ?? 0)],
      ]
    );
  };

  const sections: Record<string, { label: string; export: () => void }> = {
    overview: {
      label: "Executive Overview",
      export: handleExportOverview,
    },
    wallet: {
      label: "Wallet Report",
      export: () => {
        downloadCsv(
          `voks-wallet-${days}d.csv`,
          ["Metric", "Value"],
          [
            ["Period", `${days} days`],
            ["Minted", String(wallet?.minted ?? 0)],
            ["Spent", String(wallet?.spent ?? 0)],
            ["Net", String(wallet?.net ?? 0)],
            ["Transactions", String(wallet?.transactions ?? 0)],
            ["Active Wallets", String(wallet?.active_wallets ?? 0)],
          ]
        );
      },
    },
    commerce: {
      label: "Commerce Report",
      export: () => {
        downloadCsv(
          `voks-commerce-${days}d.csv`,
          ["Metric", "Value"],
          [
            ["Period", `${days} days`],
            ["Revenue", String(commerceKpis?.revenue ?? 0)],
            ["Orders", String(commerceKpis?.orders ?? 0)],
            ["Fulfillments", String(commerceKpis?.fulfillments ?? 0)],
            ["Refunds", String(commerceKpis?.refunds ?? 0)],
          ]
        );
      },
    },
    subscription: {
      label: "Subscription Report",
      export: () => {
        downloadCsv(
          `voks-subscription-${days}d.csv`,
          ["Metric", "Value"],
          [
            ["Period", `${days} days`],
            ["Total Subscriptions", String(subscriptionAnalytics?.total_subscriptions ?? 0)],
            ["Active Subscriptions", String(subscriptionAnalytics?.active_subscriptions ?? 0)],
            ["Total Revenue", String(subscriptionAnalytics?.total_revenue ?? 0)],
          ]
        );
      },
    },
    campaign: {
      label: "Campaign Report",
      export: () => {
        downloadCsv(
          `voks-campaign-${days}d.csv`,
          ["Metric", "Value"],
          [
            ["Period", `${days} days`],
            ["Total Campaigns", String(campaign?.total_campaigns ?? 0)],
            ["Active Campaigns", String(campaign?.active_campaigns ?? 0)],
            ["Rewards Granted", String(campaign?.rewards_granted ?? 0)],
            ["Participants", String(campaign?.participants ?? 0)],
            ["VXP Distributed", String(campaign?.vxp_distributed ?? 0)],
            ["Recent Rewards", String(campaign?.recent_rewards ?? 0)],
          ]
        );
      },
    },
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">Reporting</h1>

        <div className="flex gap-1 rounded-2xl bg-gray-100 p-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setDays(p)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                days === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p}d
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1 rounded-2xl bg-gray-100 p-1">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSelectedSection(s.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
              selectedSection === s.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <BarChart3 size={16} />
            {s.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">{sections[selectedSection]?.label}</h2>
          <button
            onClick={() => sections[selectedSection]?.export()}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {selectedSection === "overview" && (
            <>
              <MetricCard label="Revenue" value={commerceKpis?.revenue} loading={!commerceKpis} />
              <MetricCard label="Orders" value={commerceKpis?.orders} loading={!commerceKpis} />
              <MetricCard label="Wallet Minted" value={commerceKpis?.wallet_minted} loading={!commerceKpis} />
              <MetricCard label="Wallet Spent" value={commerceKpis?.wallet_spent} loading={!commerceKpis} />
              <MetricCard label="Active Subscriptions" value={commerceKpis?.active_subscriptions} loading={!commerceKpis} />
              <MetricCard label="Campaign Participants" value={commerceKpis?.campaign_participants} loading={!commerceKpis} />
              <MetricCard label="Fulfillments" value={commerceKpis?.fulfillments} loading={!commerceKpis} />
              <MetricCard label="Refunds" value={commerceKpis?.refunds} loading={!commerceKpis} />
            </>
          )}

          {selectedSection === "wallet" && (
            <>
              <MetricCard label="Minted" value={wallet?.minted} loading={!wallet} />
              <MetricCard label="Spent" value={wallet?.spent} loading={!wallet} />
              <MetricCard label="Net" value={wallet?.net} loading={!wallet} />
              <MetricCard label="Transactions" value={wallet?.transactions} loading={!wallet} />
              <MetricCard label="Active Wallets" value={wallet?.active_wallets} loading={!wallet} />
            </>
          )}

          {selectedSection === "commerce" && (
            <>
              <MetricCard label="Revenue" value={commerceKpis?.revenue} loading={!commerceKpis} />
              <MetricCard label="Orders" value={commerceKpis?.orders} loading={!commerceKpis} />
              <MetricCard label="Fulfillments" value={commerceKpis?.fulfillments} loading={!commerceKpis} />
              <MetricCard label="Refunds" value={commerceKpis?.refunds} loading={!commerceKpis} />
              <MetricCard label="Revenue (Commerce)" value={commerceAnalytics?.revenue} loading={!commerceAnalytics} />
              <MetricCard label="Top Products" value={commerceAnalytics?.top_products?.length} loading={!commerceAnalytics} />
            </>
          )}

          {selectedSection === "campaign" && (
            <>
              <MetricCard label="Total Campaigns" value={campaign?.total_campaigns} loading={!campaign} />
              <MetricCard label="Active Campaigns" value={campaign?.active_campaigns} loading={!campaign} />
              <MetricCard label="Rewards Granted" value={campaign?.rewards_granted} loading={!campaign} />
              <MetricCard label="Participants" value={campaign?.participants} loading={!campaign} />
              <MetricCard label="VXP Distributed" value={campaign?.vxp_distributed} loading={!campaign} />
              <MetricCard label="Recent Rewards" value={campaign?.recent_rewards} loading={!campaign} />
            </>
          )}

          {selectedSection === "subscription" && (
            <>
              <MetricCard label="Total" value={subscriptionAnalytics?.total_subscriptions} loading={!subscriptionAnalytics} />
              <MetricCard label="Active" value={subscriptionAnalytics?.active_subscriptions} loading={!subscriptionAnalytics} />
              <MetricCard label="Revenue" value={subscriptionAnalytics?.total_revenue} loading={!subscriptionAnalytics} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, loading }: { label: string; value: number | undefined | null; loading: boolean }) {
  return (
    <div className="rounded-xl border bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-black">{loading ? "..." : (value ?? 0).toLocaleString()}</p>
    </div>
  );
}
