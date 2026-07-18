import { AlertTriangle, RefreshCw } from "lucide-react";

interface AnalyticsErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function AnalyticsErrorState({ message, onRetry }: AnalyticsErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-red-500">
      <AlertTriangle size={48} className="opacity-70" />
      <p className="text-lg font-semibold">Failed to load analytics</p>
      <p className="max-w-md text-center text-sm text-red-400">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-bold text-white transition hover:bg-red-600"
        >
          <RefreshCw size={18} />
          Retry
        </button>
      )}
    </div>
  );
}
