import type { AuthSession, AuthUser } from '../types/auth.types'

const authTokenStorageKey = 'mpm.auth.token'
const authUserStorageKey = 'mpm.auth.user'
const authStorageKeyPrefix = 'mpm.auth.'
const authStorageEventName = 'mpm-auth-storage-change'

export function getStoredAuthToken(): string | null {
  return readLocalStorage(authTokenStorageKey)
}

export function getStoredAuthUser(): AuthUser | null {
  const storedUser = readLocalStorage(authUserStorageKey)

  if (!storedUser) {
    return null
  }

  try {
    const parsedUser: unknown = JSON.parse(storedUser)

    return isAuthUser(parsedUser) ? parsedUser : null
  } catch {
    return null
  }
}

export function getStoredAuthSession(): AuthSession | null {
  const token = getStoredAuthToken()
  const user = getStoredAuthUser()

  return token && user ? { token, user } : null
}

export function createAuthHeaders(): HeadersInit {
  const token = getStoredAuthToken()

  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function saveAuthSession(session: AuthSession): void {
  if (!isBrowserStorageAvailable()) {
    return
  }

  localStorage.setItem(authTokenStorageKey, session.token)
  localStorage.setItem(authUserStorageKey, JSON.stringify(session.user))
  notifyAuthStorageChange()
}

export function clearAuthSession(): void {
  if (!isBrowserStorageAvailable()) {
    return
  }

  getStoredAuthKeys().forEach((key) => {
    localStorage.removeItem(key)
  })
  notifyAuthStorageChange()
}

export function subscribeToAuthStorageChange(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  function handleStorageChange(event: StorageEvent) {
    if (
      event.key === authTokenStorageKey ||
      event.key === authUserStorageKey
    ) {
      callback()
    }
  }

  window.addEventListener(authStorageEventName, callback)
  window.addEventListener('storage', handleStorageChange)

  return () => {
    window.removeEventListener(authStorageEventName, callback)
    window.removeEventListener('storage', handleStorageChange)
  }
}

function notifyAuthStorageChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(authStorageEventName))
  }
}

function readLocalStorage(key: string): string | null {
  if (!isBrowserStorageAvailable()) {
    return null
  }

  return localStorage.getItem(key)
}

function isBrowserStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function getStoredAuthKeys(): string[] {
  if (!isBrowserStorageAvailable()) {
    return []
  }

  const authKeys = new Set([authTokenStorageKey, authUserStorageKey])

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)

    if (key?.startsWith(authStorageKeyPrefix)) {
      authKeys.add(key)
    }
  }

  return Array.from(authKeys)
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'number' &&
    typeof value.email === 'string' &&
    typeof value.firstName === 'string' &&
    typeof value.lastName === 'string' &&
    isNullableString(value.phone) &&
    isNullableString(value.addressLine1) &&
    isNullableString(value.addressLine2) &&
    isNullableString(value.postalCode) &&
    isNullableString(value.city) &&
    typeof value.country === 'string'
  )
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === 'string' || value === null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
