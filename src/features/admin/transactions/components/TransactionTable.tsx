import type { AdminTransaction } from "../types";

const STATUS_COLORS: Record<string, string> = {
  SUCCESS: "text-green-600 bg-green-50",
  PENDING: "text-yellow-600 bg-yellow-50",
  FAILED: "text-red-600 bg-red-50",
  ROLLED_BACK: "text-gray-500 bg-gray-100",
  EXPIRED: "text-orange-600 bg-orange-50",
};

interface Props {
  transactions: AdminTransaction[];
  onRollback: (txn: AdminTransaction) => void;
  onRetry: (txn: AdminTransaction) => void;
  rollbackPending: boolean;
  retryPending: boolean;
}

export function TransactionTable({
  transactions,
  onRollback,
  onRetry,
  rollbackPending,
  retryPending,
}: Props) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center text-gray-400 shadow">
        No transactions found
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                ID
              </th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                User
              </th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Type
              </th>
              <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Amount
              </th>
              <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Before
              </th>
              <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                After
              </th>
              <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Description
              </th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Date
              </th>
              <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => {
              const statusColor = STATUS_COLORS[txn.status] ?? "text-gray-600 bg-gray-50";
              const isCredit = txn.amount > 0;

              return (
                <tr key={txn.id} className="border-t transition-colors hover:bg-slate-50">
                  <td className="p-4 font-mono text-xs text-gray-400">
                    {txn.id}
                  </td>
                  <td className="p-4 font-mono text-xs text-gray-500">
                    {txn.user_id.slice(0, 8)}...
                  </td>
                  <td className="p-4 text-sm text-gray-700">
                    {txn.transaction_type}
                  </td>
                  <td className={`p-4 text-right text-sm font-bold ${isCredit ? "text-green-600" : "text-red-600"}`}>
                    {isCredit ? "+" : ""}{txn.amount.toLocaleString()}
                  </td>
                  <td className="p-4 text-right font-mono text-sm text-gray-500">
                    {txn.before_balance?.toLocaleString() ?? "-"}
                  </td>
                  <td className="p-4 text-right font-mono text-sm text-gray-500">
                    {txn.after_balance?.toLocaleString() ?? "-"}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="max-w-xs truncate p-4 text-sm text-gray-600">
                    {txn.description}
                  </td>
                  <td className="whitespace-nowrap p-4 text-sm text-gray-500">
                    {new Date(txn.created_at).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1">
                      {txn.status === "FAILED" && (
                        <button
                          onClick={() => onRetry(txn)}
                          disabled={retryPending}
                          className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50"
                        >
                          Retry
                        </button>
                      )}
                      {(txn.status === "SUCCESS" || txn.status === "FAILED") && (
                        <button
                          onClick={() => onRollback(txn)}
                          disabled={rollbackPending}
                          className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                        >
                          Rollback
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
