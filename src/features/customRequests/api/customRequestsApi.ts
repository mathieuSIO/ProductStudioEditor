import { env } from '../../../shared/config/env'
import { createAuthHeaders } from '../../auth'
import type {
  CreateCustomRequestPayload,
  CustomRequest,
  CustomRequestApiResponse,
  CustomRequestStatus,
  UpdateCustomRequestStatusPayload,
} from '../types'

export class CustomRequestsApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'CustomRequestsApiError'
    this.status = status
  }
}

export async function createCustomRequest(
  payload: CreateCustomRequestPayload,
): Promise<CustomRequest> {
  const request = await fetchCustomRequestResource<unknown>(
    '/api/custom-requests',
    {
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    },
  )

  return normalizeCustomRequestOrThrow(request)
}

export async function fetchAdminCustomRequests(): Promise<CustomRequest[]> {
  const requests = await fetchCustomRequestResource<unknown>(
    '/api/admin/custom-requests',
    {
      headers: createAuthHeaders(),
    },
  )

  if (!Array.isArray(requests)) {
    throw new Error('La liste des demandes personnalisees est invalide.')
  }

  return requests.map(normalizeCustomRequest).filter(isCustomRequest)
}

export async function fetchAdminCustomRequestDetails(
  requestId: string,
): Promise<CustomRequest> {
  const request = await fetchCustomRequestResource<unknown>(
    `/api/admin/custom-requests/${encodeURIComponent(requestId)}`,
    {
      headers: createAuthHeaders(),
    },
  )

  return normalizeCustomRequestOrThrow(request)
}

export async function updateAdminCustomRequestStatus(
  requestId: string,
  payload: UpdateCustomRequestStatusPayload,
): Promise<CustomRequest> {
  const request = await fetchCustomRequestResource<unknown>(
    `/api/admin/custom-requests/${encodeURIComponent(requestId)}/status`,
    {
      body: JSON.stringify(payload),
      headers: {
        ...createAuthHeaders(),
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
    },
  )

  return normalizeCustomRequestOrThrow(request)
}

async function fetchCustomRequestResource<T>(
  path: string,
  init: RequestInit,
): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, init)
  const responseBody = await readResponseBody(response)

  if (!isCustomRequestApiResponse<T>(responseBody)) {
    throw new CustomRequestsApiError(
      'La reponse serveur est invalide.',
      response.status,
    )
  }

  if (!response.ok || !responseBody.success) {
    throw new CustomRequestsApiError(
      responseBody.success
        ? 'La ressource demandee est indisponible.'
        : responseBody.message,
      response.status,
    )
  }

  return responseBody.data
}

async function readResponseBody(response: Response): Promise<unknown> {
  const responseText = await response.text()

  if (!responseText) {
    return null
  }

  try {
    return JSON.parse(responseText) as unknown
  } catch {
    return null
  }
}

function normalizeCustomRequestOrThrow(value: unknown): CustomRequest {
  const request = normalizeCustomRequest(value)

  if (!request) {
    throw new Error('La demande personnalisee est invalide.')
  }

  return request
}

function normalizeCustomRequest(value: unknown): CustomRequest | null {
  if (!isRecord(value)) {
    return null
  }

  const id = readNumber(value, 'id')
  const customerEmail =
    readString(value, 'customerEmail') ?? readString(value, 'customer_email')
  const message = readString(value, 'message')
  const status = readCustomRequestStatus(value)
  const createdAt = readString(value, 'createdAt') ?? readString(value, 'created_at')
  const updatedAt = readString(value, 'updatedAt') ?? readString(value, 'updated_at')

  if (
    id === null ||
    customerEmail === null ||
    message === null ||
    status === null ||
    createdAt === null ||
    updatedAt === null
  ) {
    return null
  }

  return {
    createdAt,
    customerEmail,
    customerFirstName:
      readString(value, 'customerFirstName') ??
      readString(value, 'customer_first_name'),
    customerLastName:
      readString(value, 'customerLastName') ??
      readString(value, 'customer_last_name'),
    customerPhone:
      readString(value, 'customerPhone') ??
      readString(value, 'customer_phone'),
    id,
    message,
    status,
    updatedAt,
  }
}

function readCustomRequestStatus(
  record: Record<string, unknown>,
): CustomRequestStatus | null {
  const status = readString(record, 'status')

  if (
    status === 'new' ||
    status === 'in_progress' ||
    status === 'quoted' ||
    status === 'closed'
  ) {
    return status
  }

  return null
}

function isCustomRequest(value: CustomRequest | null): value is CustomRequest {
  return value !== null
}

function readNumber(record: Record<string, unknown>, key: string): number | null {
  const value = record[key]

  return typeof value === 'number' && Number.isInteger(value) ? value : null
}

function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key]

  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function isCustomRequestApiResponse<T>(
  value: unknown,
): value is CustomRequestApiResponse<T> {
  if (!isRecord(value)) {
    return false
  }

  if (value.success === true) {
    return 'data' in value
  }

  return value.success === false && typeof value.message === 'string'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
