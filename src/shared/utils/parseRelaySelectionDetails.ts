import type {
  RelayPoint,
  RelaySelectionDetails,
  RelaySelectionStatus,
} from '../types/relay'

export function parseRelaySelectionDetails(
  value: unknown,
): RelaySelectionDetails | null {
  if (!isRecord(value)) {
    return null
  }

  const orderId = readInteger(value, 'orderId')
  const orderStatus = readString(value, 'orderStatus')
  const paymentStatus = readString(value, 'paymentStatus')
  const shippingMethod = readString(value, 'shippingMethod')
  const relaySelectionStatus = readRelaySelectionStatus(
    value,
    'relaySelectionStatus',
  )
  const relayPoint = parseRelayPoint(value.relayPoint)

  if (
    orderId === null ||
    orderStatus === null ||
    paymentStatus === null ||
    shippingMethod === null ||
    relaySelectionStatus === null ||
    relayPoint === undefined
  ) {
    return null
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

function parseRelayPoint(value: unknown): RelayPoint | null | undefined {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
