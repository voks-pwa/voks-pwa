interface PlayPauseButtonProps {
  isPlaying: boolean
  isLoading?: boolean
  disabled?: boolean
  onClick: () => void
}

export function PlayPauseButton({
  isPlaying,
  isLoading = false,
  disabled = false,
  onClick,
}: PlayPauseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={isPlaying ? 'Pause stream' : 'Play stream'}
      className="
        flex
        h-16
        w-16
        items-center
        justify-center
        rounded-full
        bg-white
        shadow-xl
        ring-2
        ring-white/70
        transition-all
        duration-200
        hover:scale-105
        hover:shadow-2xl
        active:scale-95
        disabled:opacity-50
        disabled:cursor-not-allowed
        sm:h-[18]
        sm:w-[8]
      "
    >
      {isLoading ? (
        <span
          className="
            h-7
            w-7
            animate-spin
            rounded-full
            border-[3px]
            border-[#bda752]/20
            border-t-[#bda752]
          "
        />
      ) : isPlaying ? (
        <svg
          viewBox="0 0 24 24"
          fill="#bda752"
          className="h-8 w-8"
        >
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="#bda752"
          className="ml-1 h-8 w-8"
        >
          <path d="M8 5v14l11-7L8 5z" />
        </svg>
      )}
    </button>
  )
}