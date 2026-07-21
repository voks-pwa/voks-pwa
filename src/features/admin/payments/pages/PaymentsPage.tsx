import { useState } from "react";
import { CreditCard, Ticket, Plus, Trash2, Check, X } from "lucide-react";
import { useAdminPayments, useAdminVouchers } from "../hooks/useAdminPayments";

const TABS = [
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "vouchers", label: "Vouchers", icon: Ticket },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-600 bg-yellow-50",
  SUCCESS: "text-green-600 bg-green-50",
  FAILED: "text-red-600 bg-red-50",
  REFUNDED: "text-purple-600 bg-purple-50",
  EXPIRED: "text-gray-500 bg-gray-100",
};

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState("payments");

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-black">Payments & Vouchers</h1>

      <div className="flex gap-1 rounded-2xl bg-gray-100 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "payments" && <PaymentsTab />}
      {activeTab === "vouchers" && <VouchersTab />}
    </div>
  );
}

function PaymentsTab() {
  const { query, updateStatus } = useAdminPayments();
  const payments = query.data ?? [];

  if (query.isLoading) {
    return <div className="rounded-3xl bg-white p-8 text-center text-gray-400 shadow">Loading payments...</div>;
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow">
      <div className="border-b px-6 py-4">
        <span className="text-sm text-gray-500">{payments.length} payment records</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">ID</th>
              <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Amount</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Method</th>
              <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Gateway</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
              <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">No payments yet</td>
              </tr>
            ) : (
              payments.map((pm) => {
                const statusColor = STATUS_COLORS[pm.payment_status] ?? "text-gray-600 bg-gray-50";
                return (
                  <tr key={pm.id} className="border-t transition-colors hover:bg-slate-50">
                    <td className="p-4 font-mono text-xs text-gray-400">{pm.id.slice(0, 8)}...</td>
                    <td className="p-4 text-right font-mono text-sm font-medium">
                      {pm.amount.toLocaleString()} {pm.currency}
                    </td>
                    <td className="p-4 text-sm text-gray-700">{pm.payment_method}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
                        {pm.payment_status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{pm.gateway || "-"}</td>
                    <td className="whitespace-nowrap p-4 text-sm text-gray-500">
                      {new Date(pm.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      {pm.payment_status === "PENDING" && (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => updateStatus.mutate({ paymentId: pm.id, status: "SUCCESS" })}
                            disabled={updateStatus.isPending}
                            className="rounded-lg bg-green-50 p-1.5 text-green-600 hover:bg-green-100"
                            title="Mark as success"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => updateStatus.mutate({ paymentId: pm.id, status: "FAILED" })}
                            disabled={updateStatus.isPending}
                            className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                            title="Mark as failed"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VouchersTab() {
  const { query, seed, remove } = useAdminVouchers();
  const [productId, setProductId] = useState("");
  const [voucherCode, setVoucherCode] = useState("");

  const vouchers = query.data ?? [];

  const handleSeed = async () => {
    if (!productId || !voucherCode) return;
    await seed.mutateAsync({ productId, voucherCode });
    setVoucherCode("");
  };

  if (query.isLoading) {
    return <div className="rounded-3xl bg-white p-8 text-center text-gray-400 shadow">Loading vouchers...</div>;
  }

  return (
    <div className="rounded-3xl bg-white shadow">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-sm text-gray-500">{vouchers.length} voucher codes</span>
      </div>

      <div className="flex flex-wrap items-end gap-3 border-b px-6 py-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Product ID</label>
          <input
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="marketplace product UUID"
            className="w-64 rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Voucher Code</label>
          <input
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
            placeholder="VOUCHER-CODE-123"
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={handleSeed}
          disabled={seed.isPending || !productId || !voucherCode}
          className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-50"
        >
          <Plus size={16} />
          {seed.isPending ? "Adding..." : "Add Voucher"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Code</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Product</th>
              <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Assigned To</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Expires</th>
              <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">No vouchers in pool</td>
              </tr>
            ) : (
              vouchers.map((v) => {
                const vStatusColor = STATUS_COLORS[v.status] ?? "text-gray-600 bg-gray-50";
                return (
                  <tr key={v.id} className="border-t transition-colors hover:bg-slate-50">
                    <td className="p-4 font-mono text-sm font-medium text-gray-900">{v.voucher_code}</td>
                    <td className="p-4 font-mono text-xs text-gray-500">{v.product_id.slice(0, 8)}...</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${vStatusColor}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-gray-500">
                      {v.assigned_user ? `${v.assigned_user.slice(0, 8)}...` : "-"}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {v.expired_at ? new Date(v.expired_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Delete voucher "${v.voucher_code}"?`)) remove.mutate(v.id);
                        }}
                        disabled={remove.isPending || v.status === "ASSIGNED" || v.status === "USED"}
                        className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100 disabled:opacity-30"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
