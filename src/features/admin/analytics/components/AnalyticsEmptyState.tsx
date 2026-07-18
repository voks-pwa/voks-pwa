import { BarChart3 } from "lucide-react";

export function AnalyticsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-gray-400">
      <BarChart3 size={48} className="opacity-50" />
      <p className="text-lg font-semibold">No analytics data yet</p>
      <p className="text-sm">
        Data will appear once users start engaging with the platform.
      </p>
    </div>
  );
}
