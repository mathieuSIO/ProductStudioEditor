import { env } from '../../../shared/config/env'
import type {
  RelayPointSelection,
  RelaySelectionDetails,
} from '../../../shared/types/relay'
import { parseRelaySelectionDetails } from '../../../shared/utils/parseRelaySelectionDetails'
import { createAuthHeaders } from '../../auth'
import { AccountApiError } from './accountApi'

export async function fetchMyOrderRelaySelection(
  orderId: number,
): Promise<RelaySelectionDetails> {
  const response = await fetch(
    `${env.apiBaseUrl}/api/me/orders/${orderId}/relay-selection`,
    {
      headers: createAuthHeaders(),
      method: 'GET',
    },
  )
  const responseBody = await readResponseBody(response)

  if (!isRecord(responseBody) || responseBody.success !== true) {
    throw new AccountApiError(
      readApiErrorMessage(responseBody) ??
        'Impossible de charger les informations de livraison.',
      response.status,
    )
  }

  if (!response.ok) {
    throw new AccountApiError(
      'Impossible de charger les informations de livraison.',
      response.status,
    )
  }

  const details = parseRelaySelectionDetails(responseBody.data)

  if (!details) {
    throw new AccountApiError(
      'La réponse de sélection du Point Relais est invalide.',
      response.status,
    )
  }

  return details
}

export async function selectMyOrderRelayPoint(
  orderId: number,
  relayPoint: RelayPointSelection,
): Promise<void> {
  const response = await fetch(
    `${env.apiBaseUrl}/api/me/orders/${orderId}/relay-point`,
    {
      body: JSON.stringify({ relayPoint }),
      headers: {
        ...createAuthHeaders(),
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
    },
  )
  const responseBody = await readResponseBody(response)

  if (!response.ok || isFailureResponse(responseBody)) {
    throw new AccountApiError(
      readApiErrorMessage(responseBody) ??
        "Votre Point Relais n'a pas pu être enregistré.",
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

function isFailureResponse(value: unknown): boolean {
  return isRecord(value) && value.success === false
}

function readApiErrorMessage(value: unknown): string | null {
  return isRecord(value) && typeof value.message === 'string'
    ? value.message
    : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
