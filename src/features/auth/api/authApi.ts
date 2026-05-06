import { env } from '../../../shared/config/env'
import type {
  AuthApiResponse,
  AuthSession,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from '../types/auth.types'

export async function loginUser(payload: LoginPayload): Promise<AuthSession> {
  return postAuthResource('/api/auth/login', payload)
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<AuthSession> {
  return postAuthResource('/api/auth/register', payload)
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
    throw new Error('La réponse serveur est invalide.')
  }

  if (!response.ok || !responseBody.success) {
    throw new Error(
      responseBody.success
        ? 'La connexion est momentanément indisponible.'
        : responseBody.message,
    )
  }

  return responseBody.data
}

async function readJsonResponse(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    throw new Error('La réponse serveur est invalide.')
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
