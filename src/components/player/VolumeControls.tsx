interface VolumeControlsProps {
  volume: number
  onChange: (volume: number) => void
  onToggleMute: () => void
}

export function VolumeControls({ volume, onChange, onToggleMute }: VolumeControlsProps) {
  const volumePercent = Math.round(volume * 100)
  const isMuted = volumePercent === 0

  return (
    <div className="flex w-full flex-col gap-4 rounded-3xl border border-black/5 bg-slate-50 px-4 py-4 text-left shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
        className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-white text-primary shadow-sm transition hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/60"
      >
        {isMuted ? (
          <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 9v6h4l3 3V6l-3 3H9z" />
            <path d="M18 6l-6 6 6 6" />
          </svg>
        ) : (
          <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-text">Volume</span>
          <span className="text-sm font-semibold text-secondary">{volumePercent}%</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={volumePercent}
          onChange={(event) => onChange(Number(event.target.value) / 100)}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-black/10 accent-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          aria-label="Volume slider"
        />
      </div>
    </div>
  )
}
