interface MissionCountdownProps {
  progress: number
  target: number
}

export function MissionCountdown({
  progress,
  target,
}: MissionCountdownProps) {
  const remaining =
    Math.max(
      target - progress,
      0
    )

  const minutes =
    Math.floor(remaining / 60)

  const seconds =
    remaining % 60

  return (
    <div className="text-sm text-gray-500">

      Remaining

      <span className="ml-2 font-semibold text-black">

        {minutes}m {seconds}s

      </span>

    </div>
  )
}