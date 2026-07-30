import type {
  MissionConfig,
} from './missionTypes'

function parseTime(
  value?: string
) {
  if (!value) return null

  const timePart = value.includes(' ') ? value.split(' ')[1] : value
  const [h, m] = timePart.split(':').map(Number)

  if (isNaN(h) || isNaN(m)) return null

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
      mission.timeStart
    )

  const end =
    parseTime(
      mission.timeEnd
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

export function isMissionInCampaignPeriod(
  mission: MissionConfig
) {
  if (!mission.dateStart && !mission.dateEnd) return true

  const now = new Date()

  if (mission.dateStart) {
    const startDate = new Date(mission.dateStart)
    if (isNaN(startDate.getTime())) return true
    if (startDate > now) return false
  }

  if (mission.dateEnd) {
    const endDate = new Date(mission.dateEnd)
    if (isNaN(endDate.getTime())) return true
    if (endDate < now) return false
  }

  return true
}