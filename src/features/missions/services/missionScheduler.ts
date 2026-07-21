import { track } from "@/core/action-engine"

let scheduler: number | null = null
let currentUserId: string | null = null

export function startMissionScheduler(userId: string) {
  if (scheduler) {
    if (currentUserId === userId) return
    clearInterval(scheduler)
    scheduler = null
  }

  currentUserId = userId
  scheduler = window.setInterval(() => {
    console.info(`[SCHEDULER] tick user=${userId}`);
    track("SCHEDULER_TICK", userId)
  }, 60 * 1000)

  console.log("MISSION SCHEDULER START", userId)
}

export function stopMissionScheduler() {
  if (!scheduler) return

  clearInterval(scheduler)
  scheduler = null
  currentUserId = null

  console.log("MISSION SCHEDULER STOP")
}
