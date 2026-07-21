import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, Activity, Users } from "lucide-react";
import { useWalletAnalytics, useCommerceKpis } from "@/features/analytics";

const PERIODS = [7, 30, 90];

export default function WalletAnalyticsPage() {
  const [days, setDays] = useState(30);

  const { data: wallet, isLoading: wLoading, isError: wError, refetch: wRefetch } = useWalletAnalytics(days);
  const { data: kpi, isLoading: kLoading } = useCommerceKpis(days);

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">Wallet Analytics</h1>

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

      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp size={18} />
            <p className="text-xs font-semibold uppercase">Minted</p>
          </div>
          <p className="mt-2 text-3xl font-black">{wLoading ? "..." : wallet?.minted.toLocaleString() ?? 0}</p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center gap-2 text-red-600">
            <TrendingDown size={18} />
            <p className="text-xs font-semibold uppercase">Spent</p>
          </div>
          <p className="mt-2 text-3xl font-black">{wLoading ? "..." : wallet?.spent.toLocaleString() ?? 0}</p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center gap-2 text-blue-600">
            <Wallet size={18} />
            <p className="text-xs font-semibold uppercase">Net</p>
          </div>
          <p className="mt-2 text-3xl font-black">{wLoading ? "..." : wallet?.net.toLocaleString() ?? 0}</p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center gap-2 text-purple-600">
            <Users size={18} />
            <p className="text-xs font-semibold uppercase">Active Wallets</p>
          </div>
          <p className="mt-2 text-3xl font-black">{wLoading ? "..." : wallet?.active_wallets.toLocaleString() ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center gap-2 text-gray-600">
            <Activity size={18} />
            <p className="text-xs font-semibold uppercase">Total Transactions</p>
          </div>
          <p className="mt-2 text-3xl font-black">{wLoading ? "..." : wallet?.transactions.toLocaleString() ?? 0}</p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center gap-2 text-amber-600">
            <TrendingUp size={18} />
            <p className="text-xs font-semibold uppercase">Wallet Minted (KPI)</p>
          </div>
          <p className="mt-2 text-3xl font-black">{kLoading ? "..." : kpi?.wallet_minted.toLocaleString() ?? 0}</p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="flex items-center gap-2 text-rose-600">
            <TrendingDown size={18} />
            <p className="text-xs font-semibold uppercase">Wallet Spent (KPI)</p>
          </div>
          <p className="mt-2 text-3xl font-black">{kLoading ? "..." : kpi?.wallet_spent.toLocaleString() ?? 0}</p>
        </div>
      </div>

      {wError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
          Failed to load wallet analytics.
          <button onClick={() => wRefetch()} className="ml-2 underline">Retry</button>
        </div>
      )}
    </div>
  );
}
