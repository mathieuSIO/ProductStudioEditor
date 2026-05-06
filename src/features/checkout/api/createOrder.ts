import { env } from '../../../shared/config/env'
import { createAuthHeaders } from '../../auth'
import type { CreateOrderPayload } from '../types'

export type CreateOrderResponse = {
  orderId: string
  status: 'received'
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<CreateOrderResponse> {
  const response = await fetch(`${env.apiBaseUrl}/api/orders`, {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      ...createAuthHeaders(),
    },
    method: 'POST',
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Connectez-vous pour finaliser votre commande.')
    }

    throw new Error('La commande n’a pas pu être envoyée.')
  }

  const responseBody = await readResponseBody(response)

  return normalizeCreateOrderResponse(responseBody)
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

function normalizeCreateOrderResponse(value: unknown): CreateOrderResponse {
  if (!isRecord(value)) {
    return {
      orderId: '',
      status: 'received',
    }
  }

  return {
    orderId:
      readStringValue(value, 'orderId') ?? readStringValue(value, 'id') ?? '',
    status: 'received',
  }
}

function readStringValue(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key]

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
