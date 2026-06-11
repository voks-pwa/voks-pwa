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
      className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:h-[4.5rem] sm:w-[4.5rem]"
    >
      {isLoading ? (
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : isPlaying ? (
        <svg
          aria-hidden="true"
          className="h-7 w-7"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          className="ml-1 h-7 w-7"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 5v14l11-7L8 5z" />
        </svg>
      )}
    </button>
  )
}
