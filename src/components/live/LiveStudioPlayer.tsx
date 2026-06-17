import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

const STREAM_URL =
  'https://live.voksradio.com/hls/stream.m3u8'

export function LiveStudioPlayer() {
  const videoRef =
    useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current

    if (!video) return

    if (Hls.isSupported()) {
      const hls = new Hls()

      hls.loadSource(STREAM_URL)

      hls.attachMedia(video)

      return () => {
        hls.destroy()
      }
    }

    if (
      video.canPlayType(
        'application/vnd.apple.mpegurl'
      )
    ) {
      video.src = STREAM_URL
    }
  }, [])

  return (
    <div className="overflow-hidden rounded-3xl bg-black shadow">
      <video
        ref={videoRef}
        controls
        playsInline
        autoPlay
        muted
        className="aspect-video w-full"
      />
    </div>
  )
}