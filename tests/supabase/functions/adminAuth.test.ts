import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockCreateClient, mockEnvGet } = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockEnvGet: vi.fn(),
}))

vi.mock('npm:@supabase/supabase-js@2', () => ({
  createClient: mockCreateClient,
}))

vi.mock('npm:zod', () => ({
  z: {},
  default: {},
}))

vi.stubGlobal('Deno', { env: { get: mockEnvGet } })

import { requireAdmin } from '../../../supabase/functions/_shared/adminAuth'
import { parseBody, validationError } from '../../../supabase/functions/_shared/validation'

function createMockSupabase() {
  const mockSingle = vi.fn()
  const mockEq = vi.fn(() => ({ single: mockSingle }))
  const mockSelect = vi.fn(() => ({ eq: mockEq }))
  const mockFrom = vi.fn(() => ({ select: mockSelect }))
  const mockGetUser = vi.fn()

  return {
    auth: { getUser: mockGetUser },
    from: mockFrom,
    _mockGetUser: mockGetUser,
    _mockSingle: mockSingle,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockEnvGet.mockReturnValue('mock-value')
})

describe('requireAdmin', () => {
  it('returns 401 when authHeader is null', async () => {
    const result = await requireAdmin(null)

    expect('error' in result).toBe(true)
    if ('error' in result) {
      const res = result.error
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body.success).toBe(false)
      expect(body.error).toBe('Missing authorization')
    }
  })

  it('returns 401 when authHeader is empty string', async () => {
    const result = await requireAdmin('')

    expect('error' in result).toBe(true)
    if ('error' in result) {
      const res = result.error
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body.error).toBe('Missing authorization')
    }
  })

  it('returns 401 when getUser fails', async () => {
    const supabase = createMockSupabase()
    mockCreateClient.mockReturnValue(supabase)
    supabase._mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' },
    })

    const result = await requireAdmin('Bearer valid-token')

    expect('error' in result).toBe(true)
    if ('error' in result) {
      const res = result.error
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body.error).toBe('Unauthorized')
    }
  })

  it('returns 403 when role is not admin', async () => {
    const supabase = createMockSupabase()
    mockCreateClient.mockReturnValue(supabase)
    supabase._mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'user@test.com' } },
      error: null,
    })
    supabase._mockSingle.mockResolvedValue({
      data: { role: 'user' },
      error: null,
    })

    const result = await requireAdmin('Bearer valid-token')

    expect('error' in result).toBe(true)
    if ('error' in result) {
      const res = result.error
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body.error).toBe('Forbidden: admin role required')
    }
  })

  it('returns 403 for regular user role', async () => {
    const supabase = createMockSupabase()
    mockCreateClient.mockReturnValue(supabase)
    supabase._mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-2', email: 'user2@test.com' } },
      error: null,
    })
    supabase._mockSingle.mockResolvedValue({
      data: { role: 'user' },
      error: null,
    })

    const result = await requireAdmin('Bearer token')

    expect('error' in result).toBe(true)
    expect(result.error.status).toBe(403)
  })

  it('returns caller with id for admin role', async () => {
    const supabase = createMockSupabase()
    mockCreateClient.mockReturnValue(supabase)
    supabase._mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', email: 'admin@test.com' } },
      error: null,
    })
    supabase._mockSingle.mockResolvedValue({
      data: { role: 'admin' },
      error: null,
    })

    const result = await requireAdmin('Bearer admin-token')

    expect('caller' in result).toBe(true)
    if ('caller' in result) {
      expect(result.caller.id).toBe('admin-1')
      expect(result.caller.email).toBe('admin@test.com')
      expect(result.caller.role).toBe('admin')
    }
  })
})

describe('parseBody', () => {
  it('parses valid JSON correctly', () => {
    const schema = { safeParse: vi.fn().mockReturnValue({ success: true, data: { name: 'test' } }) }
    const result = parseBody('{"name":"test"}', schema as never)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ name: 'test' })
    }
  })

  it('returns error for empty body', () => {
    const schema = { safeParse: vi.fn() }
    const result = parseBody(null, schema as never)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Request body is empty')
    }
  })

  it('returns error for invalid JSON', () => {
    const schema = { safeParse: vi.fn() }
    const result = parseBody('not json', schema as never)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Invalid JSON body')
    }
  })

  it('validates against Zod schema (rejects invalid data)', () => {
    const schema = {
      safeParse: vi.fn().mockReturnValue({
        success: false,
        error: {
          issues: [
            { path: ['name'], message: 'Required' },
            { path: ['age'], message: 'Must be a number' },
          ],
        },
      }),
    }
    const result = parseBody('{"name":""}', schema as never)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('name: Required')
      expect(result.error).toContain('age: Must be a number')
    }
  })
})

describe('validationError', () => {
  it('returns Response with 400 status and error message', async () => {
    const res = validationError('Something went wrong', { 'Access-Control-Allow-Origin': '*' })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toBe('Something went wrong')
  })
})
