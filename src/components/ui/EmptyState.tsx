import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-white px-6 py-12 text-center shadow-sm">
      {icon ? (
        <div className="text-gray-300">{icon}</div>
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-2xl">
          📭
        </div>
      )}
      <p className="mt-4 text-base font-semibold text-gray-700">{title}</p>
      {message && (
        <p className="mt-1 text-sm text-gray-400">{message}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
