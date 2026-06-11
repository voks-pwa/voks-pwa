interface SongArtworkProps {
  artworkUrl: string | null
  title: string
}

export function SongArtwork({ artworkUrl, title }: SongArtworkProps) {
  if (artworkUrl) {
    return (
      <img
        src={artworkUrl}
        alt={`${title} artwork`}
        className="aspect-square w-full max-w-xs rounded-2xl object-cover shadow-md ring-1 ring-black/5"
      />
    )
  }

  return (
    <div
      aria-label="No artwork available"
      className="flex aspect-square w-full max-w-xs items-center justify-center rounded-2xl bg-secondary/10 shadow-md ring-1 ring-black/5"
    >
      <svg
        aria-hidden="true"
        className="h-16 w-16 text-secondary/40"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
        />
      </svg>
    </div>
  )
}
