import { AudioPlayer } from '@/components/player/AudioPlayer'
import { usePlayerStore } from '@/stores/player-store'

export function PersistentAudioPlayer() {
  const streamUrl = usePlayerStore(
    (state) => state.streamUrl
  )

  if (!streamUrl) {
    return null
  }

  return <AudioPlayer streamUrl={streamUrl} />
}