import { useEffect, useRef } from 'react'
import { usePlayerStore } from '@/stores/player-store'

interface AudioPlayerProps {
  streamUrl: string
}

export function AudioPlayer({ streamUrl }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const volume = usePlayerStore((state) => state.volume)
  const setStreamUrl = usePlayerStore((state) => state.setStreamUrl)
  const setStatus = usePlayerStore((state) => state.setStatus)
  const setError = usePlayerStore((state) => state.setError)

  useEffect(() => {
    setStreamUrl(streamUrl)
  }, [streamUrl, setStreamUrl])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = volume
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      setStatus('loading')
      void audio.play().catch(() => {
        setError('Unable to start playback. Tap play to try again.')
        setStatus('error')
      })
    } else {
      audio.pause()
      setStatus('paused')
    }
  }, [isPlaying, setStatus, setError])

  return (
    <audio
      ref={audioRef}
      src={streamUrl}
      preload="none"
      className="hidden"
      onPlaying={() => setStatus('playing')}
      onWaiting={() => setStatus('loading')}
      onError={() => {
        setError('Stream unavailable. Please try again later.')
        setStatus('error')
      }}
    />
  )
}
