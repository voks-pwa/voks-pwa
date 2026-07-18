import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { MissionConfig } from '@/features/missions/types/mission'

const {
  mockGetMission,
  mockProcessMissionProgress,
  mockProcessDailyReset,
  mockProcessMissionClaim,
  mockAutoClaimIfEligible,
  mockRepeatMissionIfNeeded,
  mockGetRuntime,
  mockUpdateResetDate,
  mockSetProgress,
  mockAddNotification,
  mockPushMissionNotification,
} = vi.hoisted(() => ({
  mockGetMission: vi.fn(),
  mockProcessMissionProgress: vi.fn(),
  mockProcessDailyReset: vi.fn(),
  mockProcessMissionClaim: vi.fn(),
  mockAutoClaimIfEligible: vi.fn(),
  mockRepeatMissionIfNeeded: vi.fn(),
  mockGetRuntime: vi.fn(),
  mockUpdateResetDate: vi.fn(),
  mockSetProgress: vi.fn(),
  mockAddNotification: vi.fn(),
  mockPushMissionNotification: vi.fn(),
}))

vi.mock('@/features/missions/services/missionWP', () => ({ getMission: mockGetMission }))
vi.mock('@/features/missions/services/missionRuntime', () => ({
  getRuntime: mockGetRuntime,
  updateResetDate: mockUpdateResetDate,
}))
vi.mock('@/features/missions/services/missionProgressService', () => ({
  processMissionProgress: mockProcessMissionProgress,
  processDailyReset: mockProcessDailyReset,
}))
vi.mock('@/features/missions/services/MissionClaimService', () => ({
  processMissionClaim: mockProcessMissionClaim,
  autoClaimIfEligible: mockAutoClaimIfEligible,
}))
vi.mock('@/features/missions/services/missionRepeat', () => ({
  repeatMissionIfNeeded: mockRepeatMissionIfNeeded,
}))
vi.mock('@/features/notifications/notificationStore', () => ({
  useNotificationStore: { getState: () => ({ addNotification: mockAddNotification }) },
}))
vi.mock('@/features/notifications/missionNotification', () => ({
  pushMissionNotification: mockPushMissionNotification,
}))
vi.mock('@/features/missions/services/missionStore', () => ({
  useMissionStore: { getState: () => ({ setProgress: mockSetProgress }) },
}))

import { missionEngine } from '@/features/missions/services/missionEngine'

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

beforeEach(() => { vi.clearAllMocks() })

describe('missionEngine — validation guards', () => {
  it('returns blocked when userId is empty', async () => {
    const r = await missionEngine({ userId: '', missionId: 1 })
    expect(r.blocked).toBe(true)
    expect(r.message).toBe('Authentication required')
    expect(r.success).toBe(false)
  })

  it('returns blocked when missionId is falsy', async () => {
    const r = await missionEngine({ userId: 'user-1', missionId: 0 })
    expect(r.blocked).toBe(true)
    expect(r.message).toBe('Mission id required')
    expect(r.success).toBe(false)
  })

  it('returns blocked when mission is not found', async () => {
    mockGetMission.mockResolvedValue(null)
    const r = await missionEngine({ userId: 'user-1', missionId: 999 })
    expect(r.blocked).toBe(true)
    expect(r.message).toBe('Mission not found')
    expect(r.success).toBe(false)
  })
})

describe('missionEngine — daily reset flow', () => {
  it('calls processDailyReset when runtime date differs from today', async () => {
    const m = makeMission({ type: 'daily', daily: true })
    mockGetMission.mockResolvedValue(m)
    mockGetRuntime.mockReturnValue({ lastResetDate: '1990-01-01' })
    mockProcessDailyReset.mockResolvedValue({})

    const r = await missionEngine({ userId: 'user-1', missionId: 1, action: 'scheduler_tick' })

    expect(mockProcessDailyReset).toHaveBeenCalledOnce()
    expect(mockUpdateResetDate).toHaveBeenCalledOnce()
    expect(r.message).toBe('Daily Reset')
    expect(r.blocked).toBe(false)
  })

  it('skips daily reset when runtime date matches today', async () => {
    const today = new Date().toISOString().split('T')[0]
    const m = makeMission({ type: 'daily', daily: true })
    mockGetMission.mockResolvedValue(m)
    mockGetRuntime.mockReturnValue({ lastResetDate: today })

    await missionEngine({ userId: 'user-1', missionId: 1, action: 'scheduler_tick' })

    expect(mockProcessDailyReset).not.toHaveBeenCalled()
    expect(mockUpdateResetDate).not.toHaveBeenCalled()
  })
})

describe('missionEngine — progress and claim flow', () => {
  it('processes progress and returns incomplete result', async () => {
    const m = makeMission()
    mockGetMission.mockResolvedValue(m)
    mockProcessMissionProgress.mockResolvedValue({
      progress: 50, completed: false, justCompleted: false,
      blocked: false, claimed: false, message: 'Mission progress updated',
    })

    const r = await missionEngine({ userId: 'user-1', missionId: 1, amount: 50, action: 'listen_tick' })

    expect(mockProcessMissionProgress).toHaveBeenCalledWith('user-1', m, 50, 'listen_tick')
    expect(r.success).toBe(true)
    expect(r.completed).toBe(false)
    expect(r.progress).toBe(50)
    expect(r.reward).toBe(0)
    expect(r.claimed).toBe(false)
  })

  it('auto-claims when just completed and auto-claim eligible', async () => {
    const m = makeMission()
    mockGetMission.mockResolvedValue(m)
    mockProcessMissionProgress.mockResolvedValue({
      progress: 300, completed: true, justCompleted: true,
      blocked: false, claimed: false, message: 'Mission completed',
    })
    mockAutoClaimIfEligible.mockResolvedValue({
      success: true, claimed: true, reward: 100, currentVxp: 500, message: 'Reward claimed',
    })

    const r = await missionEngine({ userId: 'user-1', missionId: 1, amount: 300, action: 'listen_tick' })

    expect(mockAutoClaimIfEligible).toHaveBeenCalledOnce()
    expect(r.completed).toBe(true)
    expect(r.claimed).toBe(true)
    expect(r.reward).toBe(100)
  })

  it('falls back to manual claim when autoClaimIfEligible returns null', async () => {
    const m = makeMission()
    mockGetMission.mockResolvedValue(m)
    mockProcessMissionProgress.mockResolvedValue({
      progress: 300, completed: true, justCompleted: true,
      blocked: false, claimed: false, message: 'Mission completed',
    })
    mockAutoClaimIfEligible.mockResolvedValue(null)
    mockProcessMissionClaim.mockResolvedValue({
      success: true, claimed: true, reward: 100, currentVxp: 500, message: 'Reward claimed',
    })

    const r = await missionEngine({ userId: 'user-1', missionId: 1, amount: 300, action: 'listen_tick' })

    expect(mockAutoClaimIfEligible).toHaveBeenCalledOnce()
    expect(mockProcessMissionClaim).toHaveBeenCalledOnce()
    expect(r.claimed).toBe(true)
    expect(r.reward).toBe(100)
  })

  it('pushes notification and updates store when reward > 0', async () => {
    const m = makeMission()
    mockGetMission.mockResolvedValue(m)
    mockProcessMissionProgress.mockResolvedValue({
      progress: 300, completed: true, justCompleted: true,
      blocked: false, claimed: false, message: 'Mission completed',
    })
    mockAutoClaimIfEligible.mockResolvedValue({
      success: true, claimed: true, reward: 100, message: 'Reward claimed',
    })

    await missionEngine({ userId: 'user-1', missionId: 1, amount: 300, action: 'listen_tick' })

    expect(mockAddNotification).toHaveBeenCalledOnce()
    expect(mockPushMissionNotification).toHaveBeenCalledOnce()
    expect(mockSetProgress).toHaveBeenCalledOnce()
  })

  it('repeats mission after claim when repeatable', async () => {
    const m = makeMission({ repeat: true, repeatable: true })
    mockGetMission.mockResolvedValue(m)
    mockProcessMissionProgress.mockResolvedValue({
      progress: 300, completed: true, justCompleted: true,
      blocked: false, claimed: false, message: 'Mission completed',
    })
    mockAutoClaimIfEligible.mockResolvedValue({
      success: true, claimed: true, reward: 100, message: 'Reward claimed',
    })

    await missionEngine({ userId: 'user-1', missionId: 1, amount: 300, action: 'listen_tick' })

    expect(mockRepeatMissionIfNeeded).toHaveBeenCalledOnce()
  })

  it('skips repeat when justCompleted is false', async () => {
    const m = makeMission({ repeat: true, repeatable: true })
    mockGetMission.mockResolvedValue(m)
    mockProcessMissionProgress.mockResolvedValue({
      progress: 50, completed: false, justCompleted: false,
      blocked: false, claimed: false, message: 'Mission progress updated',
    })

    await missionEngine({ userId: 'user-1', missionId: 1, amount: 50, action: 'listen_tick' })

    expect(mockRepeatMissionIfNeeded).not.toHaveBeenCalled()
  })

  it('skips notification and store update when reward is 0', async () => {
    const m = makeMission()
    mockGetMission.mockResolvedValue(m)
    mockProcessMissionProgress.mockResolvedValue({
      progress: 50, completed: false, justCompleted: false,
      blocked: false, claimed: false, message: 'Progress',
    })

    await missionEngine({ userId: 'user-1', missionId: 1, amount: 50, action: 'listen_tick' })

    expect(mockAddNotification).not.toHaveBeenCalled()
    expect(mockPushMissionNotification).not.toHaveBeenCalled()
  })
})

describe('missionEngine — mission property flags', () => {
  it('sets repeatable/continuous/accumulative/daily flags', async () => {
    const m = makeMission({
      repeat: true, repeatable: true, listenMode: 'continuous', continuous: true,
      daily: true, type: 'daily',
    })
    mockGetMission.mockResolvedValue(m)
    mockProcessMissionProgress.mockResolvedValue({
      progress: 50, completed: false, justCompleted: false,
      blocked: false, claimed: false, message: 'Progress',
    })

    const r = await missionEngine({ userId: 'user-1', missionId: 1, amount: 50, action: 'listen_tick' })

    expect(r.repeatable).toBe(true)
    expect(r.continuous).toBe(true)
    expect(r.accumulative).toBe(false)
    expect(r.daily).toBe(true)
  })
})
