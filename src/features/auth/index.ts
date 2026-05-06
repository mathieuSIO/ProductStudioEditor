export { LoginPage } from './pages/LoginPage'
export { RegisterPage } from './pages/RegisterPage'
export { useAuth } from './hooks/useAuth'
export { createAuthHeaders, getStoredAuthToken } from './storage/authStorage'
export type {
  AuthSession,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from './types/auth.types'
