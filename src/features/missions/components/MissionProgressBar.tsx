interface MissionProgressBarProps {
  progress: number
  target: number
  completed?: boolean
}

export function MissionProgressBar({
  progress,
  target,
  completed = false,
}: MissionProgressBarProps) {
  const percentage =
    target <= 0
      ? 0
      : Math.min(
          100,
          Math.round((progress / target) * 100)
        )

  return (
    <div className="space-y-2">

      <div className="flex justify-between text-xs text-gray-500">

        <span>
          {progress} / {target}
        </span>

        <span>
          {percentage}%
        </span>

      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">

        <div
          className={`h-full rounded-full transition-all duration-500 ${
            completed
              ? "bg-green-500"
              : "bg-[#bda752]"
          }`}
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  )
}