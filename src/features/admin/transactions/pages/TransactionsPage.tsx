import { useState } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { TransactionTable } from "../components/TransactionTable";
import type { AdminTransaction } from "../types";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "SUCCESS", label: "Success" },
  { value: "FAILED", label: "Failed" },
  { value: "ROLLED_BACK", label: "Rolled Back" },
  { value: "EXPIRED", label: "Expired" },
];

export default function TransactionsPage() {
  const { query, filters, setFilters, rollback, retry } = useTransactions();
  const [confirmTxn, setConfirmTxn] = useState<AdminTransaction | null>(null);
  const [confirmAction, setConfirmAction] = useState<"rollback" | "retry" | null>(null);

  const { data, isLoading, error } = query;
  const transactions = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / (filters.pageSize ?? 50)));

  const handleRollback = (txn: AdminTransaction) => {
    setConfirmTxn(txn);
    setConfirmAction("rollback");
  };

  const handleRetry = (txn: AdminTransaction) => {
    setConfirmTxn(txn);
    setConfirmAction("retry");
  };

  const handleConfirm = async () => {
    if (!confirmTxn || !confirmAction) return;
    if (confirmAction === "rollback") {
      await rollback.mutateAsync({
        transactionKey: confirmTxn.transaction_key,
        reason: `Admin rollback by ${confirmTxn.transaction_key}`,
      });
    } else {
      await retry.mutateAsync({
        transactionKey: confirmTxn.transaction_key,
      });
    }
    setConfirmTxn(null);
    setConfirmAction(null);
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">Wallet Ledger</h1>
        <span className="text-sm text-gray-500">
          {total.toLocaleString()} total transactions
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filters.status ?? ""}
          onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="User ID..."
          value={filters.userId ?? ""}
          onChange={(e) => setFilters({ ...filters, userId: e.target.value || undefined, page: 1 })}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />

        <input
          type="text"
          placeholder="Source (MISSION, REFERRAL...)"
          value={filters.source ?? ""}
          onChange={(e) => setFilters({ ...filters, source: e.target.value || undefined, page: 1 })}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="rounded-3xl bg-white p-8 text-center text-gray-400 shadow">
          Loading transactions...
        </div>
      ) : error ? (
        <div className="rounded-3xl bg-white p-8 text-center text-red-500 shadow">
          {String(error)}
        </div>
      ) : (
        <TransactionTable
          transactions={transactions}
          onRollback={handleRollback}
          onRetry={handleRetry}
          rollbackPending={rollback.isPending}
          retryPending={retry.isPending}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setFilters({ ...filters, page: (filters.page ?? 1) - 1 })}
            disabled={(filters.page ?? 1) <= 1}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {filters.page ?? 1} of {totalPages}
          </span>
          <button
            onClick={() => setFilters({ ...filters, page: (filters.page ?? 1) + 1 })}
            disabled={(filters.page ?? 1) >= totalPages}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Confirmation dialog */}
      {confirmTxn && confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold">
              {confirmAction === "rollback" ? "Rollback Transaction" : "Retry Transaction"}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {confirmAction === "rollback"
                ? `This will reverse transaction #${confirmTxn.id} (${confirmTxn.transaction_key}) and refund ${Math.abs(confirmTxn.amount).toLocaleString()} VXP.`
                : `This will retry transaction #${confirmTxn.id} (${confirmTxn.transaction_key}).`}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => { setConfirmTxn(null); setConfirmAction(null); }}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={rollback.isPending || retry.isPending}
                className={`rounded-xl px-4 py-2 text-sm text-white transition-colors ${
                  confirmAction === "rollback"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } disabled:opacity-50`}
              >
                {confirmAction === "rollback" ? "Rollback" : "Retry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
