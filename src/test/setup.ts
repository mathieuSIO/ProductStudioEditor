import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

vi.stubEnv('VITE_API_BASE_URL', 'https://api.mpm.test')
vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'test-turnstile-site-key')
vi.stubEnv('VITE_META_PIXEL_ID', 'test-meta-pixel-id')

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
  localStorage.clear()
})
