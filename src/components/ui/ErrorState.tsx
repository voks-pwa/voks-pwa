import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-white px-6 py-12 text-center shadow-sm">
      <AlertCircle size={40} className="text-gray-300" />
      <p className="mt-4 text-sm font-medium text-gray-500">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 flex items-center gap-2 rounded-xl bg-[#bda752] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a8913f]"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      )}
    </div>
  );
}
