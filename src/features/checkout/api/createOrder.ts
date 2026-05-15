import { env } from '../../../shared/config/env'
import { createAuthHeaders } from '../../auth'
import type { CreateOrderPayload } from '../types'

export type CreateOrderResponse = {
  orderId: number
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

    throw new Error("La commande n'a pas pu etre envoyee.")
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
    throw new Error("La commande a ete creee sans identifiant exploitable.")
  }

  if (value.success === true && isRecord(value.data)) {
    return normalizeCreateOrderResponse(value.data)
  }

  const orderId = readNumberValue(value, 'orderId') ?? readNumberValue(value, 'id')

  if (orderId === null) {
    throw new Error("La commande a ete creee sans identifiant exploitable.")
  }

  return {
    orderId,
    status: 'received',
  }
}

function readNumberValue(
  record: Record<string, unknown>,
  key: string,
): number | null {
  const value = record[key]

  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value
  }

  if (typeof value === 'string') {
    const parsedValue = Number(value)

    if (Number.isInteger(parsedValue) && parsedValue > 0) {
      return parsedValue
    }
  }

  return null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
