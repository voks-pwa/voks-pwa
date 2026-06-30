import { supabase } from '@/lib/supabase'

import { canRunMission } from './missionValidator'
import {
  shouldResetOnDailyBoundary,
  shouldUnlockRepeatMission,
} from './missionRules'

import type { MissionConfig } from './missionTypes'

type MissionProgressRecord = {
  id: number
  progress?: number
  completed?: boolean
  completed_at?: string | null
  claimed?: boolean
}

export async function getMissionProgress(userId: string, missionId: number) {
  const { data, error } = await supabase
    .from('missions_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('mission_id', missionId)
    .maybeSingle()

  if (error) {
    console.error('GET PROGRESS ERROR', error)
    return null
  }

  return data as MissionProgressRecord | null
}

export async function createMissionProgress(
  userId: string,
  missionId: number,
  progress: number,
  completed: boolean
) {
  const { data, error } = await supabase
    .from('missions_progress')
    .insert({
      user_id: userId,
      mission_id: missionId,
      progress,
      completed,
      claimed: false,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) {
    console.error('CREATE PROGRESS ERROR', error)
    return null
  }

  return data
}

export async function updateMissionProgress(
  id: number,
  progress: number,
  completed: boolean,
  completedAt?: string | null,
  claimed?: boolean
) {
  const updateData: Record<string, unknown> = {
    progress,
    completed,
  }

  if (typeof claimed === 'boolean') {
    updateData.claimed = claimed
  }

  updateData.completed_at = completed ? completedAt ?? new Date().toISOString() : null

  const { data, error } = await supabase
    .from('missions_progress')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('UPDATE PROGRESS ERROR', error)
    return null
  }

  return data
}

export async function resetMissionProgress(
  userId: string,
  mission: MissionConfig,
  options?: { keepClaimed?: boolean }
) {
  const existing = await getMissionProgress(userId, mission.id)
  const claimed = options?.keepClaimed ? existing?.claimed ?? false : false

  if (!existing) {
    await createMissionProgress(userId, mission.id, 0, false)

    return {
      progress: 0,
      completed: false,
      justCompleted: false,
      blocked: false,
      claimed: false,
      message: 'Mission reset',
    }
  }

  await updateMissionProgress(existing.id, 0, false, null, claimed)

  console.log('MISSION RESET', {
    missionId: mission.id,
    claimed,
  })

  return {
    progress: 0,
    completed: false,
    justCompleted: false,
    blocked: false,
    claimed,
    message: 'Mission reset',
  }
}

// ========================================================
// TAMBAHAN: KONSTANTA ACARA PLAYER DI ATAS FUNGSI UTAMA
// ========================================================
const INTERRUPT_EVENTS = [
  'player_pause',
  'player_stop',
  'player_disconnect',
]

const LISTEN_EVENTS = [
  'player_play',
  'listen_tick',
]

export async function increaseMissionProgress(
  userId: string,
  mission: MissionConfig,
  amount = 1,
  action = 'listen_tick'
) {
  const existing = await getMissionProgress(userId, mission.id)
  const allowed = canRunMission(mission, existing)

  if (!allowed) {
    console.log('MISSION BLOCKED', {
      missionId: mission.id,
      action: mission.action,
      existing,
    })

    return {
      progress: existing?.progress ?? 0,
      completed: existing?.completed ?? false,
      justCompleted: false,
      blocked: true,
      claimed: existing?.claimed ?? false,
      message: 'Mission blocked',
    }
  }

  // ========================================================
  // PERUBAHAN: CONTINUOUS LISTENING ENGINE GANTI LOGIKA LAMA
  // ========================================================
  if (mission.listenMode === 'continuous') {
    console.log('CONTINUOUS ENGINE', action)

    if (INTERRUPT_EVENTS.includes(action)) {
      console.log('CONTINUOUS RESET')
      return resetMissionProgress(userId, mission)
    }

    if (!LISTEN_EVENTS.includes(action)) {
      return {
        progress: existing?.progress ?? 0,
        completed: existing?.completed ?? false,
        justCompleted: false,
        blocked: false,
        claimed: existing?.claimed ?? false,
        message: 'Ignored event',
      }
    }
  }

  if (action === 'scheduler_tick' && shouldResetOnDailyBoundary(mission, existing)) {
    return resetMissionProgress(userId, mission)
  }

  if (action === 'scheduler_tick' && shouldUnlockRepeatMission(mission, existing)) {
    return resetMissionProgress(userId, mission)
  }

  if (existing?.completed && mission.repeat) {
    return resetMissionProgress(userId, mission)
  }

  const target = mission.durationMinutes ? mission.durationMinutes * 60 : mission.target

  // ========================================================
  // TAMBAHAN: TELEMETRI CONSOLE LOG SEBELUM NEXT PROGRESS
  // ========================================================
  console.log('MISSION LISTEN MODE', mission.listenMode)
  console.log('MISSION TARGET', target)
  console.log('CURRENT PROGRESS', existing?.progress ?? 0)
  console.log('ADD AMOUNT', amount)

  const nextProgress = (existing?.progress ?? 0) + amount
  const completed = nextProgress >= target
  const claimed = completed ? false : existing?.claimed ?? false

  if (!existing) {
    await createMissionProgress(userId, mission.id, nextProgress, completed)

    // ========================================================
    // TAMBAHAN: LOG KEBERHASILAN MISI BARU
    // ========================================================
    console.log('MISSION COMPLETED', {
      mission: mission.title,
      progress: nextProgress,
      target,
    })

    return {
      progress: nextProgress,
      completed,
      justCompleted: completed,
      blocked: false,
      claimed: false,
      message: completed ? 'Mission completed' : 'Mission started',
    }
  }

  await updateMissionProgress(
    existing.id,
    nextProgress,
    completed,
    completed && (!existing.completed || mission.repeat)
      ? new Date().toISOString()
      : undefined,
    claimed
  )

  console.log('MISSION PROGRESS', {
    missionId: mission.id,
    progress: nextProgress,
    completed,
    claimed,
  })

  // ========================================================
  // TAMBAHAN: LOG KEBERHASILAN UPDATE PROGRES
  // ========================================================
  console.log('MISSION COMPLETED', {
    mission: mission.title,
    progress: nextProgress,
    target,
  })

  return {
    progress: nextProgress,
    completed,
    justCompleted: completed && !existing.completed,
    blocked: false,
    claimed,
    message: completed ? 'Mission completed' : 'Mission progress updated',
  }
}

// ========================================================
// TAMBAHAN BARU: FUNGSI RESET HARIAN UTK SUPABASE
// ========================================================
export async function dailyResetMission(
  userId: string,
  mission: MissionConfig
) {
  const existing = await getMissionProgress(
    userId,
    mission.id
  )

  if (!existing) return

  await updateMissionProgress(
    existing.id,
    0,
    false,
    null,
    false
  )

  console.log(
    "MISSION DAILY RESET",
    mission.title
  )
}