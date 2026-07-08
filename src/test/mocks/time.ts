import { vi } from 'vitest'

export const fixedIsoDate = '2026-01-15T10:30:00.000Z'
export const fixedTimestamp = new Date(fixedIsoDate).getTime()

export function mockStableCartIdentity(uuid = 'cart-item-test-id') {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(fixedIsoDate))
  vi.stubGlobal('crypto', {
    randomUUID: () => uuid,
  })
}
