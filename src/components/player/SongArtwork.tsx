interface SongArtworkProps {
  artworkUrl: string | null
  title: string
  isPlaying?: boolean
}

export function SongArtwork({
  artworkUrl,
  title,
  isPlaying = false,
}: SongArtworkProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Glow saat play */}
      {isPlaying && (
        <div className="absolute h-72 w-72 rounded-full bg-red-500/20 blur-3xl" />
      )}

      {/* Tonearm */}
      <div
        className={`
          absolute
          -right-4
          top-2
          z-20
          h-32
          w-2
          origin-top
          rounded-full
          bg-gray-400
          transition-transform
          duration-700
          ${isPlaying ? 'rotate-[22deg]' : 'rotate-0'}
        `}
      />

      {/* Vinyl */}
      <div className="relative">
        {artworkUrl ? (
          <img
            src={artworkUrl}
            alt={`${title} artwork`}
            style={{
              animationDuration: '12s',
            }}
            className={`
              aspect-square
              w-72
              rounded-full
              object-cover
              shadow-2xl
              ring-4
              ring-black/10
              ${isPlaying ? 'animate-spin' : ''}
            `}
          />
        ) : (
          <div
            className="
              flex
              aspect-square
              w-72
              items-center
              justify-center
              rounded-full
              bg-gray-200
            "
          >
            No Artwork
          </div>
        )}

        {/* Label tengah */}
        <div
  className="
    absolute
    left-1/2
    top-1/2
    flex
    h-20
    w-20
    -translate-x-1/2
    -translate-y-1/2
    items-center
    justify-center
    rounded-full
    text-center
    text-xs
    font-bold
  "
  style={{
    backgroundColor: '#bda752',
    color: '#2a2a2a',
  }}
>
  <div>
    VOKS
    <br />
    ON AIR
  </div>
</div>

        {/* Lubang vinyl */}
        <div
          className="
            absolute
            left-1/2
            top-1/2
            z-30
            h-3
            w-3
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-white
          "
        />
      </div>
    </div>
  )
}