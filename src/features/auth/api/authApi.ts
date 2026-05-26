import { env } from '../../../shared/config/env'
import type {
  AuthMessageApiResponse,
  AuthApiResponse,
  AuthSession,
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from '../types/auth.types'

export async function loginUser(payload: LoginPayload): Promise<AuthSession> {
  return postAuthResource('/api/auth/login', payload)
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<AuthSession> {
  return postAuthResource('/api/auth/register', payload)
}

export async function requestPasswordReset(
  payload: ForgotPasswordPayload,
): Promise<string> {
  return postAuthMessageResource('/api/auth/forgot-password', payload)
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<string> {
  return postAuthMessageResource('/api/auth/reset-password', payload)
}

async function postAuthResource<TPayload>(
  path: string,
  payload: TPayload,
): Promise<AuthSession> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  const responseBody = await readJsonResponse(response)

  if (!isAuthApiResponse(responseBody)) {
    throw new Error('La reponse serveur est invalide.')
  }

  if (!response.ok || !responseBody.success) {
    throw new Error(
      responseBody.success
        ? 'La connexion est momentanement indisponible.'
        : responseBody.message,
    )
  }

  return responseBody.data
}

async function postAuthMessageResource<TPayload>(
  path: string,
  payload: TPayload,
): Promise<string> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  const responseBody = await readJsonResponse(response)

  if (!isAuthMessageApiResponse(responseBody)) {
    throw new Error('La reponse serveur est invalide.')
  }

  if (!response.ok || !responseBody.success) {
    throw new Error(
      responseBody.success
        ? 'La demande est momentanement indisponible.'
        : responseBody.message,
    )
  }

  return responseBody.message
}

async function readJsonResponse(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    throw new Error('La reponse serveur est invalide.')
  }
}

function isAuthApiResponse(
  value: unknown,
): value is AuthApiResponse<AuthSession> {
  if (!isRecord(value)) {
    return false
  }

  if (value.success === false) {
    return typeof value.message === 'string'
  }

  return value.success === true && isAuthSession(value.data)
}

function isAuthMessageApiResponse(
  value: unknown,
): value is AuthMessageApiResponse {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.success === 'boolean' && typeof value.message === 'string'
  )
}

function isAuthSession(value: unknown): value is AuthSession {
  if (!isRecord(value)) {
    return false
  }

  return typeof value.token === 'string' && isAuthUser(value.user)
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
    isOptionalString(value.role) &&
    isNullableString(value.phone) &&
    isNullableString(value.addressLine1) &&
    isNullableString(value.addressLine2) &&
    isNullableString(value.postalCode) &&
    isNullableString(value.city) &&
    typeof value.country === 'string'
  )
}

function isOptionalString(value: unknown): value is string | undefined {
  return typeof value === 'string' || value === undefined
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === 'string' || value === null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
