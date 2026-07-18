interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-gray-100 ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
      <Skeleton className="h-48 rounded-b-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-3 h-4 w-full" />
        <div className="mt-5 flex justify-between">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-16" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white p-4 shadow-sm">
          <Skeleton className="mx-auto h-10 w-10 rounded-xl" />
          <Skeleton className="mx-auto mt-3 h-4 w-16" />
          <Skeleton className="mx-auto mt-2 h-8 w-12" />
        </div>
      ))}
    </div>
  );
}
