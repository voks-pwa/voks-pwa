import type { MissionConfig } from '@/features/missions/types/mission'

export function createMockMission(overrides?: Partial<MissionConfig>): MissionConfig {
  return {
    id: 1,
    title: 'Test Mission',
    description: 'A test mission for unit testing',
    type: 'once',
    action: 'listen',
    icon: 'music',
    badge: 'gold',
    target: 300,
    reward: 100,
    repeat: false,
    active: true,
    listenMode: '',
    repeatable: false,
    continuous: false,
    accumulative: false,
    daily: false,
    period: 'once',
    durationMinutes: undefined,
    start: '',
    end: '',
    sort: 0,
    ...overrides,
  }
}

export function createDeepMockMission(overrides?: Partial<MissionConfig>): MissionConfig {
  return {
    ...createMockMission(),
    ...overrides,
    id: overrides?.id ?? 42,
    title: overrides?.title ?? 'Deep Test Mission',
    target: overrides?.target ?? 600,
    reward: overrides?.reward ?? 200,
  }
}

export function createMockProgress(overrides?: Record<string, unknown>) {
  return {
    id: 1,
    user_id: 'user-1',
    mission_id: 1,
    progress: 0,
    completed: false,
    claimed: false,
    mission_state: 'AVAILABLE',
    period: 'once',
    completed_at: null,
    claimed_at: null,
    ...overrides,
  }
}
