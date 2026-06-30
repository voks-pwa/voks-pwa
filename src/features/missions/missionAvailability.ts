import type {
  MissionConfig,
} from './missionTypes'

function parseTime(
  value?: string
) {
  if (!value) return null

  const [h, m] =
    value.split(':').map(Number)

  return h * 60 + m
}

export function isMissionAvailableNow(
  mission: MissionConfig
) {

  if (!mission.active) {
    return false
  }

  const start =
    parseTime(
      mission.start
    )

  const end =
    parseTime(
      mission.end
    )

  if (
    start === null ||
    end === null
  ) {
    return true
  }

  const now =
    new Date()

  const minutes =
    now.getHours() * 60 +
    now.getMinutes()

  return (
    minutes >= start &&
    minutes <= end
  )

}