type MissionResult = {
  action: string
  success: boolean
  completed: boolean
  progress: number
  reward: number
  mission: string
  message?: string
}

let latestResult: MissionResult | null = null

const listeners = new Set<() => void>()

export function setMissionResult(result: MissionResult) {
  latestResult = result

  listeners.forEach(listener => listener())
}

export function getMissionResult() {
  return latestResult
}

export function subscribeMissionResult(
  listener: () => void
) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export type { MissionResult }