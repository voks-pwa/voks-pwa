import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { EconomyConfig } from '@/features/economy/types'

const {
  mockGetEconomyConfig,
  mockCheckSpendingLimit,
  mockGetUserBalance,
  mockGetXpRule,
  mockGetDailyEarnings,
} = vi.hoisted(() => ({
  mockGetEconomyConfig: vi.fn(),
  mockCheckSpendingLimit: vi.fn(),
  mockGetUserBalance: vi.fn(),
  mockGetXpRule: vi.fn(),
  mockGetDailyEarnings: vi.fn(),
}))

vi.mock('@/features/economy/repositories/economyRepository', () => ({
  getEconomyConfig: mockGetEconomyConfig,
  checkSpendingLimit: mockCheckSpendingLimit,
  getUserBalance: mockGetUserBalance,
  getXpRule: mockGetXpRule,
  getDailyEarnings: mockGetDailyEarnings,
  logSpending: vi.fn(),
}))

const { mockGetCanonicalUser } = vi.hoisted(() => ({
  mockGetCanonicalUser: vi.fn(),
}))

vi.mock('@/features/profile/services/userCanonicalService', () => ({
  getCanonicalUser: mockGetCanonicalUser,
}))

const { mockComputeMultiplier } = vi.hoisted(() => ({
  mockComputeMultiplier: vi.fn(),
}))

vi.mock('@/features/economy/services/multiplierEngine', () => ({
  computeMultiplier: mockComputeMultiplier,
}))

const { mockGetFallbackXP } = vi.hoisted(() => ({
  mockGetFallbackXP: vi.fn(),
}))

vi.mock('@/features/economy/sources', () => ({
  getFallbackXP: mockGetFallbackXP,
}))

import { validateTransaction, calculateXP } from '@/features/economy/services/economyEngine'

const defaultConfig: EconomyConfig = {
  CURRENCIES: ['VXP'],
  VXP_EARNING_DAILY_CAP: 200,
  VXP_SPENDING_DAILY_CAP: 500,
  VXP_SPENDING_WEEKLY_CAP: 2000,
  VXP_SPENDING_MONTHLY_CAP: 8000,
  VXP_MIN_BALANCE_FOR_REDEMPTION: 100,
  ECONOMY_VERSION: 1,
}

function mockCanonical(overrides?: Record<string, unknown>) {
  return {
    id: 'user-1',
    wallet: { balance: 500, lifetime_vxp: 2000 },
    level: 5,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('validateTransaction()', () => {
  it('allows valid transaction with positive amount', async () => {
    mockGetEconomyConfig.mockResolvedValue(defaultConfig)
    mockGetCanonicalUser.mockResolvedValue(mockCanonical())

    const result = await validateTransaction({ userId: 'user-1', amount: 100 })

    expect(result.allowed).toBe(true)
    expect(result.hasSufficientBalance).toBe(true)
    expect(mockCheckSpendingLimit).not.toHaveBeenCalled()
  })

  it('rejects when economy config is unavailable', async () => {
    mockGetEconomyConfig.mockResolvedValue(null)

    const result = await validateTransaction({ userId: 'user-1', amount: 100 })

    expect(result.allowed).toBe(false)
    expect(result.error).toBe('Economy config not available')
    expect(result.hasSufficientBalance).toBe(false)
  })

  it('checks spending limit for debit transactions', async () => {
    mockGetEconomyConfig.mockResolvedValue(defaultConfig)
    mockCheckSpendingLimit.mockResolvedValue({
      allowed: false,
      wouldExceed: 'daily' as const,
      daily: { spent: 600, cap: 500, remaining: -100 },
      weekly: { spent: 600, cap: 2000, remaining: 1400 },
      monthly: { spent: 600, cap: 8000, remaining: 7400 },
      proposed: 100,
    })

    const result = await validateTransaction({ userId: 'user-1', amount: -100 })

    expect(result.allowed).toBe(false)
    expect(result.error).toContain('Spending limit exceeded')
    expect(mockCheckSpendingLimit).toHaveBeenCalledWith('user-1', 100, 'VXP')
  })

  it('rejects debit when balance is insufficient', async () => {
    mockGetEconomyConfig.mockResolvedValue(defaultConfig)
    mockCheckSpendingLimit.mockResolvedValue({
      allowed: true,
      wouldExceed: null,
      daily: { spent: 50, cap: 500, remaining: 450 },
      weekly: { spent: 50, cap: 2000, remaining: 1950 },
      monthly: { spent: 50, cap: 8000, remaining: 7950 },
      proposed: 100,
    })
    mockGetUserBalance.mockResolvedValue(40)

    const result = await validateTransaction({ userId: 'user-1', amount: -100 })

    expect(result.allowed).toBe(false)
    expect(result.error).toBe('Insufficient balance: 40 < 100')
    expect(result.hasSufficientBalance).toBe(false)
  })
})

describe('calculateXP()', () => {
  it('calculates base XP correctly from rule', async () => {
    mockGetXpRule.mockResolvedValue({
      slug: 'MISSION_COMPLETE',
      base_xp: 100,
      enabled: true,
    })
    mockGetCanonicalUser.mockResolvedValue(mockCanonical({ level: 1 }))
    mockComputeMultiplier.mockResolvedValue({
      finalMultiplier: 1.0,
      bonus: 0,
      breakdown: [{ slug: 'global-default', title: 'Global Default', type: 'global', value: 1.0 }],
    })
    mockGetEconomyConfig.mockResolvedValue(defaultConfig)
    mockGetDailyEarnings.mockResolvedValue(0)

    const result = await calculateXP({ source: 'MISSION_COMPLETE', userId: 'user-1' })

    expect(result.baseXP).toBe(100)
    expect(result.finalXP).toBe(100)
    expect(result.fromFallback).toBe(false)
  })

  it('applies multiplier from multiplierEngine', async () => {
    mockGetXpRule.mockResolvedValue({
      slug: 'MISSION_DAILY',
      base_xp: 50,
      enabled: true,
    })
    mockGetCanonicalUser.mockResolvedValue(mockCanonical({ level: 1 }))
    mockComputeMultiplier.mockResolvedValue({
      finalMultiplier: 1.5,
      bonus: 25,
      breakdown: [
        { slug: 'global-default', title: 'Global Default', type: 'global', value: 1.0 },
        { slug: 'weekend-bonus', title: 'Weekend Bonus', type: 'event', value: 1.5 },
      ],
    })
    mockGetEconomyConfig.mockResolvedValue(defaultConfig)
    mockGetDailyEarnings.mockResolvedValue(0)

    const result = await calculateXP({ source: 'MISSION_DAILY', userId: 'user-1' })

    expect(result.baseXP).toBe(50)
    expect(result.multiplier).toBe(1.5)
    expect(result.finalXP).toBe(75)
    expect(result.bonus).toBe(25)
  })

  it('enforces daily earning cap', async () => {
    mockGetXpRule.mockResolvedValue({
      slug: 'MISSION_COMPLETE',
      base_xp: 200,
      enabled: true,
    })
    mockGetCanonicalUser.mockResolvedValue(mockCanonical({ level: 1 }))
    mockComputeMultiplier.mockResolvedValue({
      finalMultiplier: 1.0,
      bonus: 0,
      breakdown: [{ slug: 'global-default', title: 'Global Default', type: 'global', value: 1.0 }],
    })
    mockGetEconomyConfig.mockResolvedValue({
      ...defaultConfig,
      VXP_EARNING_DAILY_CAP: 200,
    })
    mockGetDailyEarnings.mockResolvedValue(180)

    const result = await calculateXP({ source: 'MISSION_COMPLETE', userId: 'user-1' })

    expect(result.finalXP).toBe(20)
  })
})
