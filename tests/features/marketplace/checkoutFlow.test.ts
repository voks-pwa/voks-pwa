import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Cart, CartItem } from '@/features/checkout/types'
import type { OrderStatus } from '@/features/marketplace/types'

const {
  mockGetActiveCart,
  mockLockOrderInventory,
  mockReleaseOrderInventory,
  mockDeductOrderInventory,
  mockUpdateOrderStatus,
  mockDebit,
  mockValidateTransaction,
  mockInitiatePayment,
  mockRecordEvent,
  mockRequestVoucher,
  mockConfirmVoucherAssignment,
  mockGetInventoryByProductId,
} = vi.hoisted(() => ({
  mockGetActiveCart: vi.fn(),
  mockLockOrderInventory: vi.fn(),
  mockReleaseOrderInventory: vi.fn(),
  mockDeductOrderInventory: vi.fn(),
  mockUpdateOrderStatus: vi.fn(),
  mockDebit: vi.fn(),
  mockValidateTransaction: vi.fn(),
  mockInitiatePayment: vi.fn(),
  mockRecordEvent: vi.fn(),
  mockRequestVoucher: vi.fn(),
  mockConfirmVoucherAssignment: vi.fn(),
  mockGetInventoryByProductId: vi.fn(),
}))

vi.mock('@/features/checkout/services/cartService', () => ({
  getActiveCart: mockGetActiveCart,
}))

vi.mock('@/features/checkout/repositories/checkoutRepository', () => ({
  lockOrderInventory: mockLockOrderInventory,
  releaseOrderInventory: mockReleaseOrderInventory,
  deductOrderInventory: mockDeductOrderInventory,
  updateOrderStatus: mockUpdateOrderStatus,
}))

vi.mock('@/core/checkout-engine', () => ({
  debit: mockDebit,
  validateTransaction: mockValidateTransaction,
  initiatePayment: mockInitiatePayment,
  recordEvent: mockRecordEvent,
  requestVoucher: mockRequestVoucher,
  confirmVoucherAssignment: mockConfirmVoucherAssignment,
  getInventoryByProductId: mockGetInventoryByProductId,
}))

import { executeCheckout } from '@/features/checkout/services/checkoutService'

const defaultOrder = {
  id: 'order-1',
  user_id: 'user-1',
  order_status: 'DRAFT' as OrderStatus,
  total_amount: 500,
  currency: 'VXP',
  expires_at: null as string | null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

const defaultItems: CartItem[] = [
  {
    id: 'item-1',
    order_id: 'order-1',
    product_id: 'prod-1',
    product_name: 'Digital Album',
    product_type: 'DIGITAL',
    quantity: 1,
    unit_price: 500,
    subtotal: 500,
  },
]

function makeCart(overrides?: Partial<Cart>): Cart {
  return {
    order: { ...defaultOrder },
    items: [...defaultItems],
    total: 500,
    ...overrides,
  }
}

function emptyCart(): Cart {
  return { order: null, items: [], total: 0 }
}

beforeEach(() => { vi.clearAllMocks() })

describe('executeCheckout', () => {
  it('succeeds with valid VXP payment', async () => {
    mockGetActiveCart.mockResolvedValue(makeCart())
    mockLockOrderInventory.mockResolvedValue({ success: true })
    mockUpdateOrderStatus.mockResolvedValue({ success: true })
    mockValidateTransaction.mockResolvedValue({ allowed: true })
    mockDebit.mockResolvedValue({ success: true, transaction_id: 42, current_vxp: 9500 })
    mockGetInventoryByProductId.mockResolvedValue({ unlimited: true })
    mockDeductOrderInventory.mockResolvedValue({ success: true })
    mockRecordEvent.mockResolvedValue(undefined)

    const result = await executeCheckout('user-1')

    expect(result.success).toBe(true)
    expect(result.order_id).toBe('order-1')
    expect(result.transaction_id).toBe(42)
    expect(result.current_vxp).toBe(9500)
    expect(result.payment_method).toBe('VXP')
    expect(mockLockOrderInventory).toHaveBeenCalledWith('order-1')
    expect(mockDebit).toHaveBeenCalled()
    expect(mockDeductOrderInventory).toHaveBeenCalledWith('order-1')
    expect(mockUpdateOrderStatus).toHaveBeenCalledWith('order-1', 'PAID')
  })

  it('rejects empty userId', async () => {
    const result = await executeCheckout('')

    expect(result.success).toBe(false)
    expect(result.error).toBe('User ID required')
  })

  it('rejects empty cart', async () => {
    mockGetActiveCart.mockResolvedValue(emptyCart())

    const result = await executeCheckout('user-1')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Cart is empty')
  })

  it('rejects invalid total', async () => {
    mockGetActiveCart.mockResolvedValue(makeCart({ total: 0 }))

    const result = await executeCheckout('user-1')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid cart total')
  })

  it('fails gracefully when inventory lock fails', async () => {
    mockGetActiveCart.mockResolvedValue(makeCart())
    mockLockOrderInventory.mockResolvedValue({ success: false, error: 'Stock reservation failed' })

    const result = await executeCheckout('user-1')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Stock reservation failed')
  })

  it('releases inventory and cancels order on payment failure', async () => {
    mockGetActiveCart.mockResolvedValue(makeCart())
    mockLockOrderInventory.mockResolvedValue({ success: true })
    mockUpdateOrderStatus.mockResolvedValue({ success: true })
    mockValidateTransaction.mockResolvedValue({ allowed: true })
    mockDebit.mockResolvedValue({ success: false, error: 'Insufficient VXP balance' })

    const result = await executeCheckout('user-1')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Insufficient VXP balance')
    expect(mockReleaseOrderInventory).toHaveBeenCalledWith('order-1')
    expect(mockUpdateOrderStatus).toHaveBeenCalledWith('order-1', 'CANCELLED')
  })

  it('confirms voucher assignment on success', async () => {
    const cart = makeCart({
      items: [
        ...defaultItems,
        {
          id: 'item-2',
          order_id: 'order-1',
          product_id: 'prod-voucher',
          product_name: 'Gift Card',
          product_type: 'VOUCHER',
          quantity: 1,
          unit_price: 100,
          subtotal: 100,
        },
      ],
      total: 600,
    })
    mockGetActiveCart.mockResolvedValue(cart)
    mockLockOrderInventory.mockResolvedValue({ success: true })
    mockUpdateOrderStatus.mockResolvedValue({ success: true })
    mockValidateTransaction.mockResolvedValue({ allowed: true })
    mockDebit.mockResolvedValue({ success: true, transaction_id: 99, current_vxp: 9400 })
    mockGetInventoryByProductId.mockResolvedValue({ unlimited: true })
    mockDeductOrderInventory.mockResolvedValue({ success: true })
    mockRequestVoucher.mockResolvedValue({ success: true, voucher_id: 'voucher-abc' })
    mockConfirmVoucherAssignment.mockResolvedValue({ success: true })
    mockRecordEvent.mockResolvedValue(undefined)

    const result = await executeCheckout('user-1')

    expect(result.success).toBe(true)
    expect(mockRequestVoucher).toHaveBeenCalledWith('prod-voucher')
    expect(mockConfirmVoucherAssignment).toHaveBeenCalledWith('voucher-abc', 'user-1')
  })
})
