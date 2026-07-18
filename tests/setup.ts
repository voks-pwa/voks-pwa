import { beforeAll } from 'vitest'

beforeAll(() => {
  // Suppress console noise from mission engine during tests
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
