import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { MissionConfig } from '@/features/missions/types/mission'

const {
  mockGetMissionProgress,
  mockCreateMissionProgress,
  mockUpdateMissionProgress,
} = vi.hoisted(() => ({
  mockGetMissionProgress: vi.fn(),
  mockCreateMissionProgress: vi.fn(),
  mockUpdateMissionProgress: vi.fn(),
}))

vi.mock('@/features/missions/repositories/missionProgressRepository', () => ({
  getMissionProgress: mockGetMissionProgress,
  createMissionProgress: mockCreateMissionProgress,
  updateMissionProgress: mockUpdateMissionProgress,
}))

import { processMissionProgress } from '@/features/missions/services/missionProgressService'

function makeMission(overrides?: Partial<MissionConfig>): MissionConfig {
  return {
    id: 1, title: 'Listen Mission', description: '', type: 'once',
    action: 'listen', icon: 'music', badge: '', target: 300,
    reward: 100, repeat: false, active: true, listenMode: '',
    repeatable: false, continuous: false, accumulative: false,
    daily: false, period: 'once', start: '', end: '', sort: 0,
    durationMinutes: undefined, ...overrides,
  }
}

function existing(overrides?: Record<string, unknown>) {
  return {
    id: 1, user_id: 'user-1', mission_id: 1,
    progress: 50, completed: false, claimed: false,
    mission_state: 'IN_PROGRESS', period: 'once',
    completed_at: null, claimed_at: null,
    ...overrides,
  }
}

const progress120 = () => existing({ progress: 120, mission_id: 1 })

beforeEach(() => { vi.clearAllMocks() })

describe('blocked mission', () => {
  it('returns blocked when mission is inactive', async () => {
    mockGetMissionProgress.mockResolvedValue(null)
    const r = await processMissionProgress('user-1', makeMission({ active: false }))
    expect(r.blocked).toBe(true)
    expect(r.message).toBe('Mission blocked')
  })
})

describe('first run — no existing progress', () => {
  it('creates new progress and returns started', async () => {
    const m = makeMission({ target: 300 })
    mockGetMissionProgress.mockResolvedValue(null)
    const r = await processMissionProgress('user-1', m, 50)

    expect(mockCreateMissionProgress).toHaveBeenCalledWith('user-1', 1, 50, false)
    expect(r.progress).toBe(50)
    expect(r.completed).toBe(false)
    expect(r.message).toBe('Mission started')
  })

  it('creates and completes when amount reaches target', async () => {
    mockGetMissionProgress.mockResolvedValue(null)
    const r = await processMissionProgress('user-1', makeMission({ target: 10 }), 10)

    expect(mockCreateMissionProgress).toHaveBeenCalledWith('user-1', 1, 10, true)
    expect(r.completed).toBe(true)
    expect(r.justCompleted).toBe(true)
    expect(r.message).toBe('Mission completed')
  })

  it('caps progress at target', async () => {
    mockGetMissionProgress.mockResolvedValue(null)
    const r = await processMissionProgress('user-1', makeMission({ target: 5 }), 100)

    expect(r.progress).toBe(5)
    expect(r.completed).toBe(true)
  })
})

describe('with existing progress', () => {
  it('adds amount to existing progress', async () => {
    mockGetMissionProgress.mockResolvedValue(progress120())
    const r = await processMissionProgress('user-1', makeMission({ target: 300 }), 30)

    expect(r.progress).toBe(150)
    expect(r.completed).toBe(false)
    expect(r.message).toBe('Mission progress updated')
  })

  it('detects justCompleted when crossing target', async () => {
    mockGetMissionProgress.mockResolvedValue(existing({ progress: 90, mission_id: 1 }))
    const r = await processMissionProgress('user-1', makeMission({ target: 100 }), 20)

    expect(r.progress).toBe(100)
    expect(r.completed).toBe(true)
    expect(r.justCompleted).toBe(true)
    expect(r.message).toBe('Mission completed')
  })

  it('does not re-justComplete on second call after completion', async () => {
    mockGetMissionProgress.mockResolvedValue(existing({
      progress: 100, completed: true,
      completed_at: new Date().toISOString(),
    }))
    const r = await processMissionProgress('user-1', makeMission({ target: 100 }), 50)

    expect(r.completed).toBe(true)
    expect(r.justCompleted).toBe(false)
  })
})

describe('continuous listen mode', () => {
  const continuousMission = () => makeMission({ listenMode: 'continuous', continuous: true })

  it('adds progress on listen_tick', async () => {
    mockGetMissionProgress.mockResolvedValue(progress120())
    const r = await processMissionProgress('user-1', continuousMission(), 1, 'listen_tick')

    expect(r.progress).toBe(121)
    expect(r.message).toBe('Mission progress updated')
  })

  it('resets on player_pause', async () => {
    mockGetMissionProgress.mockResolvedValue(progress120())
    const r = await processMissionProgress('user-1', continuousMission(), 0, 'player_pause')

    expect(mockUpdateMissionProgress).toHaveBeenCalledWith(1, 0, false, null, false)
    expect(r.progress).toBe(0)
    expect(r.message).toBe('Mission reset')
  })

  it('resets on player_stop', async () => {
    mockGetMissionProgress.mockResolvedValue(progress120())
    const r = await processMissionProgress('user-1', continuousMission(), 0, 'player_stop')

    expect(r.progress).toBe(0)
    expect(r.message).toBe('Mission reset')
  })

  it('resets on player_disconnect', async () => {
    mockGetMissionProgress.mockResolvedValue(progress120())
    const r = await processMissionProgress('user-1', continuousMission(), 0, 'player_disconnect')

    expect(r.progress).toBe(0)
    expect(r.message).toBe('Mission reset')
  })

  it('resets on listen_pause', async () => {
    mockGetMissionProgress.mockResolvedValue(progress120())
    const r = await processMissionProgress('user-1', continuousMission(), 0, 'listen_pause')

    expect(r.progress).toBe(0)
  })

  it('returns ignored for unrelated actions', async () => {
    mockGetMissionProgress.mockResolvedValue(progress120())
    const r = await processMissionProgress('user-1', continuousMission(), 0, 'share')

    expect(r.message).toBe('Ignored')
    expect(r.progress).toBe(120)
  })

  it('handles reset when no progress exists', async () => {
    mockGetMissionProgress.mockResolvedValue(null)
    const r = await processMissionProgress('user-1', continuousMission(), 0, 'player_pause')

    expect(r.progress).toBe(0)
    expect(r.message).toBe('Mission reset')
    expect(mockUpdateMissionProgress).not.toHaveBeenCalled()
  })

  it('processes listen action in continuous mode', async () => {
    mockGetMissionProgress.mockResolvedValue(progress120())
    const r = await processMissionProgress('user-1', continuousMission(), 30, 'listen')

    expect(r.progress).toBe(150)
    expect(r.message).toBe('Mission progress updated')
  })
})

describe('accumulative listen mode', () => {
  const accumulativeMission = () => makeMission({ listenMode: 'accumulative', accumulative: true })

  it('adds progress on player_pause (no reset)', async () => {
    mockGetMissionProgress.mockResolvedValue(progress120())
    const r = await processMissionProgress('user-1', accumulativeMission(), 0, 'player_pause')

    expect(r.progress).toBe(120)
    expect(r.message).toBe('Mission progress updated')
  })

  it('adds progress on listen_tick', async () => {
    mockGetMissionProgress.mockResolvedValue(progress120())
    const r = await processMissionProgress('user-1', accumulativeMission(), 30, 'listen_tick')

    expect(r.progress).toBe(150)
    expect(r.message).toBe('Mission progress updated')
  })

  it('adds progress on player_stop (no reset)', async () => {
    mockGetMissionProgress.mockResolvedValue(progress120())
    const r = await processMissionProgress('user-1', accumulativeMission(), 0, 'player_stop')

    expect(r.progress).toBe(120)
  })
})

describe('daily boundary', () => {
  it('resets when completed_at is yesterday', async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString()
    mockGetMissionProgress.mockResolvedValue(existing({
      progress: 300, completed: true, completed_at: yesterday,
    }))
    mockUpdateMissionProgress.mockResolvedValue({})

    const r = await processMissionProgress('user-1', makeMission({
      type: 'daily', daily: true, repeat: true, repeatable: true,
    }), 0, 'scheduler_tick')

    expect(r.progress).toBe(0)
    expect(r.message).toBe('Mission reset')
  })

  it('does not reset when completed_at is today', async () => {
    const today = new Date().toISOString()
    mockGetMissionProgress.mockResolvedValue(existing({
      progress: 300, completed: true, completed_at: today,
    }))

    mockUpdateMissionProgress.mockResolvedValue({})

    const r = await processMissionProgress('user-1', makeMission({
      type: 'daily', daily: true, repeat: true, repeatable: true,
    }), 0, 'scheduler_tick')

    expect(r.message).not.toBe('Mission reset')
  })
})

describe('repeat unlock', () => {
  it('resets for repeatable completed mission', async () => {
    mockGetMissionProgress.mockResolvedValue(existing({
      progress: 300, completed: true,
      completed_at: new Date().toISOString(),
    }))
    const r = await processMissionProgress('user-1', makeMission({ repeat: true, repeatable: true }), 0, 'scheduler_tick')

    expect(r.progress).toBe(0)
    expect(r.message).toBe('Mission reset')
  })
})

describe('durationMinutes target', () => {
  it('uses durationMinutes * 60 as target when present', async () => {
    mockGetMissionProgress.mockResolvedValue(existing({ progress: 0, mission_id: 1 }))
    const r = await processMissionProgress('user-1', makeMission({ durationMinutes: 5, target: 999 }), 300)

    expect(r.completed).toBe(true)
    expect(r.progress).toBe(300)
  })
})
