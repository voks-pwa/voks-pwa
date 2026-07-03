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
      aria-label={isPlaying ? "Pause stream" : "Play stream"}
      className="
        group
        flex
        h-20
        w-20
        items-center
        justify-center
        rounded-full
        bg-[#bda752]
        text-white
        shadow-xl
        transition-all
        duration-200
        hover:scale-105
        hover:shadow-2xl
        active:scale-95
        disabled:cursor-not-allowed
        disabled:opacity-50

        sm:h-24
        sm:w-24
      "
    >
      {isLoading ? (
        <span
          className="
            h-9
            w-9
            animate-spin
            rounded-full
            border-4
            border-white/30
            border-t-white
          "
        />
      ) : isPlaying ? (
        <svg
          viewBox="0 0 24 24"
          className="h-11 w-11 fill-white"
        >
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="ml-1 h-11 w-11 fill-white"
        >
          <path d="M8 5v14l11-7L8 5z" />
        </svg>
      )}
    </button>
  )
}