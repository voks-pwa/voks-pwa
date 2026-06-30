type MissionLog = {
  time: string
  title: string
  payload?: unknown
}

let logs: MissionLog[] = []

const listeners = new Set<() => void>()

export function addMissionLog(
  title: string,
  payload?: unknown
) {
  logs.unshift({
    time: new Date().toLocaleTimeString(),
    title,
    payload,
  })

  logs = logs.slice(0, 100)

  listeners.forEach(listener => listener())
}

export function getMissionLogs() {
  return logs
}

export function clearMissionLogs() {
  logs = []

  listeners.forEach(listener => listener())
}

export function subscribeMissionLog(
  listener: () => void
) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}