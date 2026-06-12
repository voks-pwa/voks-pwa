import { AudioPlayer } from '@/components/player/AudioPlayer'
import { ListenerCount } from '@/components/player/ListenerCount'
import { LiveStatusBadge } from '@/components/player/LiveStatusBadge'
import { PlayPauseButton } from '@/components/player/PlayPauseButton'
import { SongArtwork } from '@/components/player/SongArtwork'
import { VolumeControls } from '@/components/player/VolumeControls'
import { getDisplayTrack } from '@/lib/now-playing'
import { useNowPlaying } from '@/hooks/use-now-playing'
import { usePlayerStore } from '@/stores/player-store'

export function AudioPlayerCard() {
  const { data, isLoading, isError } = useNowPlaying()
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const status = usePlayerStore((state) => state.status)
  const toggle = usePlayerStore((state) => state.toggle)

  const displayTrack = getDisplayTrack(data)
  const streamUrl = data?.station.listen_url
  const listenerCount = data?.listeners.current ?? 0
  const isOnline = data?.is_online ?? false
  const volume = usePlayerStore((state) => state.volume)
  const setVolume = usePlayerStore((state) => state.setVolume)
  const toggleMute = usePlayerStore((state) => state.toggleMute)

  return (
    <section
      aria-label="Audio player"
      className="flex w-full flex-col items-center gap-6 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8"
    >
      <LiveStatusBadge
        isOnline={isOnline}
        isLive={displayTrack.isLive}
      />

      <SongArtwork
        artworkUrl={displayTrack.artworkUrl}
        title={displayTrack.title}
      />

      <div className="w-full space-y-1 text-center">
        <h1 className="text-xl font-semibold text-text sm:text-2xl">
          {isError ? 'Unable to load station' : displayTrack.title}
        </h1>
        <p className="text-base text-secondary">
          {isError ? 'Check your connection' : displayTrack.artist}
        </p>
      </div>

      <ListenerCount count={listenerCount} />

      <VolumeControls
        volume={volume}
        onChange={setVolume}
        onToggleMute={toggleMute}
      />

      <PlayPauseButton
        isPlaying={isPlaying}
        isLoading={status === 'loading' || isLoading}
        disabled={!streamUrl || !isOnline || isError}
        onClick={toggle}
      />

      {streamUrl && <AudioPlayer streamUrl={streamUrl} />}
    </section>
  )
}
