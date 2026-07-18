interface AnalyticsSkeletonProps {
  count?: number;
}

export function AnalyticsSkeleton({ count = 4 }: AnalyticsSkeletonProps) {
  return (
    <div className="space-y-6 p-8">
      <div className="h-10 w-48 animate-pulse rounded-xl bg-gray-200" />
      <div className="h-5 w-72 animate-pulse rounded-xl bg-gray-200" />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-3xl bg-gray-200"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {[1, 2].map((n) => (
          <div
            key={n}
            className="h-96 animate-pulse rounded-3xl bg-gray-200"
          />
        ))}
      </div>
    </div>
  );
}
