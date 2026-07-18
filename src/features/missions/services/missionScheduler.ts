import { track } from "@/core/action-engine"

let scheduler: number | null = null

export function startMissionScheduler(userId: string) {
  if (scheduler) return

  scheduler = window.setInterval(() => {
    console.info(`[SCHEDULER] tick user=${userId}`);
    track("SCHEDULER_TICK", userId)
  }, 60 * 1000)

  console.log("MISSION SCHEDULER START")
}

export function stopMissionScheduler() {
  if (!scheduler) return

  clearInterval(scheduler)
  scheduler = null

  console.log("MISSION SCHEDULER STOP")
}
