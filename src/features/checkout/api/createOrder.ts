import { env } from '../../../shared/config/env'
import { createAuthHeaders } from '../../auth'
import type { CreateOrderPayload } from '../types'

export type CreateOrderResponse = {
  orderId: string
  status: 'received'
}

export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {

  const response = await fetch(`${env.apiBaseUrl}/api/orders`, {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      ...createAuthHeaders(),
    },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('La commande n’a pas pu être envoyée.')
  }

  const responseBody: unknown = await response.json()

  if (!isCreateOrderResponse(responseBody)) {
    throw new Error('La réponse serveur est invalide.')
  }

  return responseBody
}

function isCreateOrderResponse(value: unknown): value is CreateOrderResponse {
  if (!isRecord(value)) {
    return false
  }

  return typeof value.orderId === 'string' && value.status === 'received'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
