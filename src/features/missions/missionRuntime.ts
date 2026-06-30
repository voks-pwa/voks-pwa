// src/features/missions/missionRuntime.ts

// 1. PERBAIKAN INTERFACE: Menambahkan properti lastResetDate
export interface MissionRuntime {
  listening: boolean
  startedAt: number | null
  lastTick: number | null
  continuousSeconds: number
  accumulativeSeconds: number
  lastResetDate: string // 🌟 Field Baru untuk melacak tanggal reset terakhir
}

const runtime = new Map<string, MissionRuntime>()

function getState(userId: string): MissionRuntime {
  const existing = runtime.get(userId)

  if (existing) {
    return existing
  }

  // 2. PERBAIKAN INITIAL STATE: Inisialisasi awal otomatis dengan tanggal hari ini
  const state: MissionRuntime = {
    listening: false,
    startedAt: null,
    lastTick: null,
    continuousSeconds: 0,
    accumulativeSeconds: 0,
    lastResetDate: new Date().toDateString(), // 🌟 Menghasilkan string seperti "Mon Jun 29 2026"
  }

  runtime.set(userId, state)
  return state
}

export function startListening(userId: string) {
  const state = getState(userId)

  state.listening = true
  state.startedAt = Date.now()
  state.lastTick = Date.now()

  console.log('MISSION RUNTIME START', state)
}

export function stopListening(userId: string) {
  const state = getState(userId)

  state.listening = false
  state.startedAt = null
  state.lastTick = null

  console.log('MISSION RUNTIME STOP', state)
}

export function interruptListening(userId: string) {
  const state = getState(userId)

  state.listening = false
  state.startedAt = null
  state.lastTick = null
  state.continuousSeconds = 0

  console.log('MISSION RUNTIME INTERRUPT', state)
}

export function addListeningSecond(userId: string) {
  const state = getState(userId)

  if (!state.listening) {
    return state
  }

  state.lastTick = Date.now()
  state.continuousSeconds += 1
  state.accumulativeSeconds += 1

  console.log('MISSION RUNTIME TICK', state)
  return state
}

export function resetContinuous(userId: string) {
  const state = getState(userId)

  state.continuousSeconds = 0

  console.log('MISSION RUNTIME RESET CONTINUOUS', state)
}

export function resetAccumulative(userId: string) {
  const state = getState(userId)

  state.accumulativeSeconds = 0

  console.log('MISSION RUNTIME RESET ACCUMULATIVE', state)
}

export function resetRuntime(userId: string) {
  runtime.delete(userId)

  console.log('MISSION RUNTIME DELETE', userId)
}

export function getRuntime(userId: string): MissionRuntime {
  return getState(userId)
}

export function updateResetDate(userId: string) {
  const state = getState(userId)

  state.lastResetDate = new Date().toDateString()

  console.log(
    'MISSION UPDATE RESET DATE',
    state.lastResetDate
  )
}

/*
|--------------------------------------------------------------------------
| Debug Helper
|--------------------------------------------------------------------------
*/

if (typeof window !== 'undefined') {
  window.missionRuntime = {
    startListening,
    stopListening,
    addListening(userId: string, seconds: number) {
      for (let i = 0; i < seconds; i++) {
        addListeningSecond(userId)
      }
    },
    resetListening: resetRuntime,
    getRuntime,
  }
}