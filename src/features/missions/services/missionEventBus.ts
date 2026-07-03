export interface MissionEvent {
  action: string
  userId: string
  amount?: number
  payload?: Record<string, unknown>
}

type Listener = (
  event: MissionEvent
) => void

const listeners =
  new Set<Listener>()

export function subscribeMissionEvent(
  listener: Listener
) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function emitMissionEvent(
  event: MissionEvent
) {
  console.log(
    'MISSION EVENT',
    event
  )

  listeners.forEach(listener => {
    listener(event)
  })
}