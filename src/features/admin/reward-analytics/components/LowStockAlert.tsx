import { AlertTriangle, AlertCircle } from "lucide-react";
import type { LowStockItem } from "../types";

interface LowStockAlertProps {
  items: LowStockItem[];
}

export function LowStockAlert({ items }: LowStockAlertProps) {
  const critical = items.filter((i) => i.status === "critical");
  const warning = items.filter((i) => i.status === "warning");

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
        <h3 className="mb-2 text-lg font-semibold text-gray-800">Low Stock Alerts</h3>
        <p className="text-sm text-emerald-600">All items are well-stocked</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Low Stock Alerts</h3>

      {critical.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-600">
            <AlertCircle size={16} /> Critical ({critical.length})
          </p>
          <div className="space-y-2">
            {critical.map((item) => (
              <div
                key={item.reward_id}
                className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-2 text-sm"
              >
                <span className="font-medium text-red-700">Reward #{item.reward_id}</span>
                <span className="text-red-600">Stock: {item.current_stock}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {warning.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-600">
            <AlertTriangle size={16} /> Warning ({warning.length})
          </p>
          <div className="space-y-2">
            {warning.map((item) => (
              <div
                key={item.reward_id}
                className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-2 text-sm"
              >
                <span className="font-medium text-amber-700">Reward #{item.reward_id}</span>
                <span className="text-amber-600">{item.current_stock} / {item.warning_stock} min</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
