import { emitMissionEvent } from "./missionEventBus"

let scheduler: number | null = null

export function startMissionScheduler(userId: string) {
  if (scheduler) return

  scheduler = window.setInterval(() => {
    emitMissionEvent({
      action: "scheduler_tick",
      userId,
      amount: 1,
    })
  }, 60 * 1000)

  console.log("MISSION SCHEDULER START")
}

export function stopMissionScheduler() {
  if (!scheduler) return

  clearInterval(scheduler)

  scheduler = null

  console.log("MISSION SCHEDULER STOP")
}