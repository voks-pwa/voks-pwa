interface LiveStatusBadgeProps {
  isOnline: boolean
  isLive: boolean
}

export function LiveStatusBadge({ isOnline, isLive }: LiveStatusBadgeProps) {
  const label = !isOnline ? 'Offline' : isLive ? 'Live' : 'On Air'
  const dotColor = !isOnline ? 'bg-neutral-400' : isLive ? 'bg-red-500' : 'bg-[#bda752]'
  const pulse = isOnline ? 'animate-pulse' : ''

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ${
        !isOnline
          ? 'bg-neutral-100 text-neutral-500'
          : isLive
            ? 'bg-red-50 text-red-600 ring-1 ring-red-200'
            : 'bg-[#bda752]/15 text-[#5B5B3F]'
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span aria-hidden="true" className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor} ${pulse}`} />
        <span aria-hidden="true" className={`relative inline-flex h-2 w-2 rounded-full ${dotColor}`} />
      </span>
      {label}
    </span>
  )
}
