import { useEffect, useState } from 'react'

import { loginUser, registerUser } from '../api/authApi'
import {
  clearAuthSession,
  getStoredAuthSession,
  saveAuthSession,
  subscribeToAuthStorageChange,
} from '../storage/authStorage'
import type {
  AuthSession,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from '../types/auth.types'

type UseAuthResult = {
  error: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<AuthSession>
  logout: () => void
  register: (payload: RegisterPayload) => Promise<AuthSession>
  token: string | null
  user: AuthUser | null
}

export function useAuth(): UseAuthResult {
  const [session, setSession] = useState<AuthSession | null>(() =>
    getStoredAuthSession(),
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return subscribeToAuthStorageChange(() => {
      setSession(getStoredAuthSession())
    })
  }, [])

  async function login(payload: LoginPayload): Promise<AuthSession> {
    return authenticate(() => loginUser(payload))
  }

  async function register(payload: RegisterPayload): Promise<AuthSession> {
    return authenticate(() => registerUser(payload))
  }

  async function authenticate(
    requestAuthSession: () => Promise<AuthSession>,
  ): Promise<AuthSession> {
    setIsLoading(true)
    setError(null)

    try {
      const authSession = await requestAuthSession()
      saveAuthSession(authSession)
      setSession(authSession)

      return authSession
    } catch (authError) {
      const message =
        authError instanceof Error
          ? authError.message
          : 'La demande d’authentification a échoué.'

      setError(message)
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  function logout(): void {
    clearAuthSession()
    setSession(null)
    setError(null)
  }

  return {
    error,
    isAuthenticated: Boolean(session?.token),
    isLoading,
    login,
    logout,
    register,
    token: session?.token ?? null,
    user: session?.user ?? null,
  }
}
