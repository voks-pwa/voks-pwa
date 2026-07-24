import { describe, it, expect, vi, beforeEach } from 'vitest'

const {
  mockCreateTransaction,
  mockCommitTransaction,
  mockFailTransaction,
} = vi.hoisted(() => ({
  mockCreateTransaction: vi.fn(),
  mockCommitTransaction: vi.fn(),
  mockFailTransaction: vi.fn(),
}))

vi.mock('@/features/wallet/repositories/walletRepository', () => ({
  createTransaction: mockCreateTransaction,
  commitTransaction: mockCommitTransaction,
  failTransaction: mockFailTransaction,
}))

const { mockValidateTransaction, mockRecordSpending } = vi.hoisted(() => ({
  mockValidateTransaction: vi.fn(),
  mockRecordSpending: vi.fn(),
}))

vi.mock('@/features/economy/services/economyEngine', () => ({
  validateTransaction: mockValidateTransaction,
  recordSpending: mockRecordSpending,
}))

const { mockGetCanonicalUser } = vi.hoisted(() => ({
  mockGetCanonicalUser: vi.fn(),
}))

vi.mock('@/features/profile/services/userCanonicalService', () => ({
  getCanonicalUser: mockGetCanonicalUser,
}))

import { credit, debit, generateTransactionKey } from '@/features/wallet/services/walletEngine'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('credit()', () => {
  it('creates and commits a transaction on success', async () => {
    mockValidateTransaction.mockResolvedValue({ allowed: true })
    mockCreateTransaction.mockResolvedValue({ success: true })
    mockCommitTransaction.mockResolvedValue({ success: true, amount: 100, current_vxp: 500, lifetime_vxp: 1000 })

    const result = await credit({
      userId: 'user-1',
      amount: 100,
      transactionType: 'MISSION_REWARD',
      referenceType: 'mission',
      referenceId: 'mission-1',
      description: 'Mission complete reward',
    })

    expect(mockValidateTransaction).toHaveBeenCalledWith({ userId: 'user-1', amount: 100 })
    expect(mockCreateTransaction).toHaveBeenCalledWith({
      userId: 'user-1',
      amount: 100,
      transactionType: 'MISSION_REWARD',
      transactionKey: 'MISSION_REWARD_user-1_mission-1',
      source: 'mission',
      referenceId: 'mission-1',
      description: 'Mission complete reward',
    })
    expect(mockCommitTransaction).toHaveBeenCalledWith('MISSION_REWARD_user-1_mission-1')
    expect(result.success).toBe(true)
    expect(result.amount).toBe(100)
    expect(result.current_vxp).toBe(500)
  })

  it('rejects missing userId with error', async () => {
    const result = await credit({
      userId: '',
      amount: 100,
      transactionType: 'MISSION_REWARD',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('User ID required')
    expect(mockValidateTransaction).not.toHaveBeenCalled()
    expect(mockCreateTransaction).not.toHaveBeenCalled()
  })

  it('rejects negative amount', async () => {
    const result = await credit({
      userId: 'user-1',
      amount: -50,
      transactionType: 'MISSION_REWARD',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Amount must be positive')
    expect(mockValidateTransaction).not.toHaveBeenCalled()
  })

  it('rejects zero amount', async () => {
    const result = await credit({
      userId: 'user-1',
      amount: 0,
      transactionType: 'MISSION_REWARD',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Amount must be positive')
  })

  it('uses provided transactionKey instead of generating one', async () => {
    mockValidateTransaction.mockResolvedValue({ allowed: true })
    mockCreateTransaction.mockResolvedValue({ success: true })
    mockCommitTransaction.mockResolvedValue({ success: true })

    await credit({
      userId: 'user-1',
      amount: 100,
      transactionType: 'MISSION_REWARD',
      transactionKey: 'custom-key-123',
      referenceId: 'mission-1',
    })

    expect(mockCreateTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ transactionKey: 'custom-key-123' }),
    )
    expect(mockCommitTransaction).toHaveBeenCalledWith('custom-key-123')
  })
})

describe('debit()', () => {
  it('creates and commits a transaction on success', async () => {
    mockValidateTransaction.mockResolvedValue({ allowed: true })
    mockCreateTransaction.mockResolvedValue({ success: true })
    mockCommitTransaction.mockResolvedValue({ success: true })
    mockRecordSpending.mockResolvedValue(true)

    const result = await debit({
      userId: 'user-1',
      amount: 50,
      transactionType: 'REDEEM',
      referenceType: 'reward',
      referenceId: 'reward-1',
      description: 'Reward redemption',
    })

    expect(mockValidateTransaction).toHaveBeenCalledWith({ userId: 'user-1', amount: -50 })
    expect(mockCreateTransaction).toHaveBeenCalledWith({
      userId: 'user-1',
      amount: -50,
      transactionType: 'REDEEM',
      transactionKey: 'REDEEM_user-1_reward-1',
      source: 'reward',
      referenceId: 'reward-1',
      description: 'Reward redemption',
    })
    expect(mockCommitTransaction).toHaveBeenCalledWith('REDEEM_user-1_reward-1')
    expect(mockRecordSpending).toHaveBeenCalledWith('user-1', 50)
    expect(result.success).toBe(true)
  })

  it('rejects missing userId with error', async () => {
    const result = await debit({
      userId: '',
      amount: 50,
      transactionType: 'REDEEM',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('User ID required')
    expect(mockValidateTransaction).not.toHaveBeenCalled()
    expect(mockCreateTransaction).not.toHaveBeenCalled()
  })

  it('rejects negative amount', async () => {
    const result = await debit({
      userId: 'user-1',
      amount: -10,
      transactionType: 'REDEEM',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Amount must be positive')
    expect(mockValidateTransaction).not.toHaveBeenCalled()
  })

  it('rejects zero amount', async () => {
    const result = await debit({
      userId: 'user-1',
      amount: 0,
      transactionType: 'REDEEM',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Amount must be positive')
  })

  it('calls failTransaction when commit fails', async () => {
    mockValidateTransaction.mockResolvedValue({ allowed: true })
    mockCreateTransaction.mockResolvedValue({ success: true })
    mockCommitTransaction.mockResolvedValue({ success: false, error: 'Insufficient VXP' })

    const result = await debit({
      userId: 'user-1',
      amount: 50,
      transactionType: 'REDEEM',
      transactionKey: 'txn-1',
    })

    expect(mockFailTransaction).toHaveBeenCalledWith('txn-1', 'Insufficient VXP')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Insufficient VXP')
  })
})

describe('generateTransactionKey()', () => {
  it('generates deterministic key with referenceId', () => {
    const key = generateTransactionKey('MISSION_REWARD', 'user-1', 'mission-42')
    expect(key).toBe('MISSION_REWARD_user-1_mission-42')
  })

  it('uses manual_ prefix when no referenceId', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-23T12:00:00Z'))

    const key = generateTransactionKey('BONUS', 'user-2')
    expect(key).toBe('BONUS_user-2_manual_1784808000000')

    vi.useRealTimers()
  })
})
