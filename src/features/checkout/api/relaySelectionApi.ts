import { env } from '../../../shared/config/env'
import { createAuthHeaders } from '../../auth'
import type {
  RelayPoint,
  RelaySelectionDetails,
  RelaySelectionStatus,
  SelectRelayPointPayload,
} from '../types'

export class RelaySelectionApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'RelaySelectionApiError'
    this.status = status
  }
}

export async function fetchRelaySelection(
  checkoutSessionId: string,
): Promise<RelaySelectionDetails> {
  const response = await fetch(
    `${env.apiBaseUrl}/api/orders/relay-selection?checkoutSessionId=${encodeURIComponent(checkoutSessionId)}`,
    {
      headers: createAuthHeaders(),
      method: 'GET',
    },
  )
  const responseBody = await readResponseBody(response)

  if (!isRecord(responseBody) || responseBody.success !== true) {
    throw new RelaySelectionApiError(
      readApiErrorMessage(responseBody) ??
        'La verification de la commande est momentanement indisponible.',
      response.status,
    )
  }

  if (!response.ok) {
    throw new RelaySelectionApiError(
      'La verification de la commande est momentanement indisponible.',
      response.status,
    )
  }

  return normalizeRelaySelectionDetails(responseBody.data)
}

export async function selectRelayPoint(
  payload: SelectRelayPointPayload,
): Promise<void> {
  const response = await fetch(`${env.apiBaseUrl}/api/orders/relay-point`, {
    body: JSON.stringify(payload),
    headers: {
      ...createAuthHeaders(),
      'Content-Type': 'application/json',
    },
    method: 'PATCH',
  })
  const responseBody = await readResponseBody(response)

  if (!response.ok || isFailureResponse(responseBody)) {
    throw new RelaySelectionApiError(
      readApiErrorMessage(responseBody) ??
        "Le Point Relais n'a pas pu etre enregistre.",
      response.status,
    )
  }
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

function normalizeRelaySelectionDetails(value: unknown): RelaySelectionDetails {
  if (!isRecord(value)) {
    throwInvalidResponse()
  }

  const orderId = readInteger(value, 'orderId')
  const orderStatus = readString(value, 'orderStatus')
  const paymentStatus = readString(value, 'paymentStatus')
  const shippingMethod = readString(value, 'shippingMethod')
  const relaySelectionStatus = readRelaySelectionStatus(
    value,
    'relaySelectionStatus',
  )
  const relayPoint = normalizeRelayPoint(value.relayPoint)

  if (
    orderId === null ||
    orderStatus === null ||
    paymentStatus === null ||
    shippingMethod === null ||
    relaySelectionStatus === null ||
    relayPoint === undefined
  ) {
    throwInvalidResponse()
  }

  return {
    orderId,
    orderStatus,
    paymentStatus,
    shippingMethod,
    relaySelectionStatus,
    relayPoint,
  }
}

function normalizeRelayPoint(value: unknown): RelayPoint | null | undefined {
  if (value === null) {
    return null
  }

  if (!isRecord(value)) {
    return undefined
  }

  const id = readString(value, 'id')
  const name = readString(value, 'name')
  const addressLine1 = readString(value, 'addressLine1')
  const addressLine2 = readNullableString(value, 'addressLine2')
  const postalCode = readString(value, 'postalCode')
  const city = readString(value, 'city')
  const country = readString(value, 'country')
  const latitude = readNullableNumber(value, 'latitude')
  const longitude = readNullableNumber(value, 'longitude')

  if (
    id === null ||
    name === null ||
    addressLine1 === null ||
    addressLine2 === undefined ||
    postalCode === null ||
    city === null ||
    country === null ||
    latitude === undefined ||
    longitude === undefined
  ) {
    return undefined
  }

  return {
    id,
    name,
    addressLine1,
    addressLine2,
    postalCode,
    city,
    country,
    latitude,
    longitude,
  }
}

function readRelaySelectionStatus(
  record: Record<string, unknown>,
  key: string,
): RelaySelectionStatus | null {
  const value = record[key]

  return value === 'not_required' || value === 'pending' || value === 'selected'
    ? value
    : null
}

function readInteger(
  record: Record<string, unknown>,
  key: string,
): number | null {
  const value = record[key]

  return typeof value === 'number' && Number.isInteger(value) ? value : null
}

function readString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key]

  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function readNullableString(
  record: Record<string, unknown>,
  key: string,
): string | null | undefined {
  const value = record[key]

  return value === null || typeof value === 'string' ? value : undefined
}

function readNullableNumber(
  record: Record<string, unknown>,
  key: string,
): number | null | undefined {
  const value = record[key]

  return value === null ||
    (typeof value === 'number' && Number.isFinite(value))
    ? value
    : undefined
}

function isFailureResponse(value: unknown): boolean {
  return isRecord(value) && value.success === false
}

function readApiErrorMessage(value: unknown): string | null {
  return isRecord(value) && typeof value.message === 'string'
    ? value.message
    : null
}

function throwInvalidResponse(): never {
  throw new RelaySelectionApiError(
    'La reponse de selection du Point Relais ne respecte pas le contrat attendu.',
    200,
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
