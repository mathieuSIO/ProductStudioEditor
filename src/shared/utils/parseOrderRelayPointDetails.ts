import type {
  OrderRelayPointDetails,
  RelaySelectionStatus,
} from '../types/relay'

export type ParsedOrderRelayPointDetails = {
  relayPoint: OrderRelayPointDetails | null
  shippingMethod: string | null
}

export function parseOrderRelayPointDetails(
  value: unknown,
): ParsedOrderRelayPointDetails {
  if (!isRecord(value)) {
    return { relayPoint: null, shippingMethod: null }
  }

  const shippingMethod = readString(value, 'shippingMethod', 'shipping_method')
  const selectionStatus = readRelaySelectionStatus(
    value,
    'relaySelectionStatus',
    'relay_selection_status',
  )

  if (shippingMethod !== 'mondial_relay' || selectionStatus === null) {
    return { relayPoint: null, shippingMethod }
  }

  return {
    shippingMethod,
    relayPoint: {
      selectionStatus,
      id: readString(value, 'relayPointId', 'relay_point_id'),
      name: readString(value, 'relayPointName', 'relay_point_name'),
      addressLine1: readString(
        value,
        'relayPointAddressLine1',
        'relay_point_address_line1',
      ),
      addressLine2: readString(
        value,
        'relayPointAddressLine2',
        'relay_point_address_line2',
      ),
      postalCode: readString(
        value,
        'relayPointPostalCode',
        'relay_point_postal_code',
      ),
      city: readString(value, 'relayPointCity', 'relay_point_city'),
      country: readString(value, 'relayPointCountry', 'relay_point_country'),
      selectedAt: readString(
        value,
        'relayPointSelectedAt',
        'relay_point_selected_at',
      ),
    },
  }
}

function readRelaySelectionStatus(
  record: Record<string, unknown>,
  camelCaseKey: string,
  snakeCaseKey: string,
): RelaySelectionStatus | null {
  const value = record[camelCaseKey] ?? record[snakeCaseKey]

  return value === 'not_required' || value === 'pending' || value === 'selected'
    ? value
    : null
}

function readString(
  record: Record<string, unknown>,
  camelCaseKey: string,
  snakeCaseKey: string,
): string | null {
  const value = record[camelCaseKey] ?? record[snakeCaseKey]

  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
