function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-gray-200/70 ${className}`} />;
}

export function HeroSkeleton() {
  return (
    <div
      className="w-full overflow-hidden rounded-[28px] shadow-lg"
      style={{ minHeight: 320 }}
    >
      <Skeleton className="h-full min-h-[320px] w-full" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-full" />
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export function CampaignListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-6">
      <HeroSkeleton />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
