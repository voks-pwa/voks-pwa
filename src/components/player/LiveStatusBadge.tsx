interface LiveStatusBadgeProps {
  isOnline: boolean
  isLive: boolean
}

export function LiveStatusBadge({ isOnline, isLive }: LiveStatusBadgeProps) {
  const label = !isOnline ? 'Offline' : isLive ? 'Live' : 'On Air'
  const isActive = isOnline

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ${
        isActive
          ? 'bg-primary/15 text-secondary'
          : 'bg-neutral-100 text-neutral-500'
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${
          isActive ? 'animate-pulse bg-primary' : 'bg-neutral-400'
        }`}
      />
      {label}
    </span>
  )
}
