export function FloatingPlayer() {
  const streamUrl = usePlayerStore(
    (state) => state.streamUrl
  )

  if (!streamUrl) return null

  return (
    <AudioPlayer streamUrl={streamUrl} />
  )
}