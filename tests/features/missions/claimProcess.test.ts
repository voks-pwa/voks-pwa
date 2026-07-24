import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { MissionConfig } from '@/features/missions/types/mission'

const { mockRpc, mockFrom, mockSelect, mockEq, mockMaybeSingle, mockCalculateXP, mockGrantReward } = vi.hoisted(() => ({
  mockRpc: vi.fn(),
  mockFrom: vi.fn(),
  mockSelect: vi.fn(),
  mockEq: vi.fn(),
  mockMaybeSingle: vi.fn(),
  mockCalculateXP: vi.fn(),
  mockGrantReward: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: { rpc: mockRpc, from: mockFrom },
}))

vi.mock('@/features/economy/services/economyEngine', () => ({
  calculateXP: mockCalculateXP,
}))

vi.mock('@/core/reward-engine', () => ({
  grantReward: mockGrantReward,
}))

import { processMissionClaim, autoClaimIfEligible } from '@/features/missions/services/MissionClaimService'

mockFrom.mockReturnValue({ select: mockSelect })
mockSelect.mockReturnValue({ eq: mockEq })
mockEq.mockReturnValue({
  eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })),
  maybeSingle: mockMaybeSingle,
})

function makeMission(overrides?: Partial<MissionConfig>): MissionConfig {
  return {
    id: 1, title: 'Claim Test', description: '', type: 'once',
    action: 'listen', icon: 'music', badge: '', target: 300,
    reward: 100, repeat: false, active: true, listenMode: '',
    repeatable: false, continuous: false, accumulative: false,
    daily: false, period: 'once', start: '', end: '', sort: 0,
    durationMinutes: undefined, ...overrides,
  }
}

beforeEach(() => { 
  vi.clearAllMocks()
  mockCalculateXP.mockResolvedValue({ finalXP: 100 })
  mockGrantReward.mockResolvedValue({ success: true, skipped: false })
})

describe('processMissionClaim', () => {
  it('returns error when userId is empty', async () => {
    const r = await processMissionClaim('', makeMission())
    expect(r.success).toBe(false)
    expect(r.message).toBe('Authentication required')
  })

  it('calls claim_mission_reward RPC with correct params', async () => {
    mockCalculateXP.mockResolvedValue({ finalXP: 200 })
    mockRpc.mockResolvedValue({ data: { success: true, reward: 200, current_vxp: 1500 }, error: null })

    await processMissionClaim('user-abc', makeMission({ id: 42, reward: 200, period: 'once' }))

    expect(mockRpc).toHaveBeenCalledWith('claim_mission_reward', {
      p_user_id: 'user-abc', p_mission_id: 42, p_reward_vxp: 200, p_period: 'once',
    })
  })

  it('returns success when RPC succeeds', async () => {
    mockRpc.mockResolvedValue({ data: { success: true, reward: 100, current_vxp: 500 }, error: null })
    const r = await processMissionClaim('user-1', makeMission({ reward: 100 }))

    expect(r.success).toBe(true)
    expect(r.claimed).toBe(true)
    expect(r.reward).toBe(100)
    expect(r.currentVxp).toBe(500)
    expect(r.message).toBe('Reward claimed')
  })

  it('returns error on RPC error', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const r = await processMissionClaim('user-1', makeMission())

    expect(r.success).toBe(false)
    expect(r.message).toBe('DB error')
  })

  it('returns error when RPC result success is false', async () => {
    mockRpc.mockResolvedValue({ data: { success: false, error: 'Already claimed' }, error: null })
    const r = await processMissionClaim('user-1', makeMission())

    expect(r.success).toBe(false)
    expect(r.message).toBe('Already claimed')
  })

  it('falls back to mission.reward when RPC omits reward', async () => {
    mockCalculateXP.mockResolvedValue({ finalXP: 75 })
    mockRpc.mockResolvedValue({ data: { success: true, current_vxp: 600 }, error: null })
    const r = await processMissionClaim('user-1', makeMission({ reward: 75 }))

    expect(r.reward).toBe(75)
  })

  it('uses default message when RPC error field is missing', async () => {
    mockRpc.mockResolvedValue({ data: { success: false }, error: null })
    const r = await processMissionClaim('user-1', makeMission())

    expect(r.success).toBe(false)
    expect(r.message).toBe('Claim failed')
  })
})

describe('autoClaimIfEligible', () => {
  it('returns null for non-auto-claim missions', async () => {
    const r = await autoClaimIfEligible('user-1', makeMission({ action: 'listen' }))
    expect(r).toBeNull()
  })

  it('auto-claims profile mission when not claimed', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { claimed: false }, error: null })
    mockRpc.mockResolvedValue({ data: { success: true, reward: 100, current_vxp: 500 }, error: null })

    const r = await autoClaimIfEligible('user-1', makeMission({ id: 10, action: 'profile', reward: 100 }))

    expect(r).not.toBeNull()
    expect(r!.success).toBe(true)
    expect(r!.claimed).toBe(true)
  })

  it('auto-claims checkin mission when not claimed', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { claimed: false }, error: null })
    mockRpc.mockResolvedValue({ data: { success: true, reward: 25, current_vxp: 750 }, error: null })

    const r = await autoClaimIfEligible('user-1', makeMission({ id: 20, action: 'checkin', reward: 25 }))

    expect(r).not.toBeNull()
    expect(r!.success).toBe(true)
  })

  it('returns null when profile already claimed', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { claimed: true }, error: null })
    const r = await autoClaimIfEligible('user-1', makeMission({ action: 'profile' }))

    expect(r).toBeNull()
  })

  it('auto-claims checkin when no existing progress row', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null })
    mockRpc.mockResolvedValue({ data: { success: true, reward: 25, current_vxp: 750 }, error: null })

    const r = await autoClaimIfEligible('user-1', makeMission({ id: 20, action: 'checkin' }))

    expect(r).not.toBeNull()
    expect(r!.claimed).toBe(true)
  })

  it('passes correct params to claim RPC from auto-claim', async () => {
    mockCalculateXP.mockResolvedValue({ finalXP: 50 })
    mockMaybeSingle.mockResolvedValue({ data: null, error: null })
    mockRpc.mockResolvedValue({ data: { success: true, reward: 50, current_vxp: 1200 }, error: null })

    await autoClaimIfEligible('user-1', makeMission({ id: 30, action: 'profile', reward: 50, period: 'once' }))

    expect(mockRpc).toHaveBeenCalledWith('claim_mission_reward', {
      p_user_id: 'user-1', p_mission_id: 30, p_reward_vxp: 50, p_period: 'once',
    })
  })
})
