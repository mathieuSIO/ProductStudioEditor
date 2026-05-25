import { env } from '../../../shared/config/env'
import { createAuthHeaders } from '../../auth'

export type ShippingEstimateItem = {
  productId: number
  quantity: number
}

export type ShippingEstimatePayload = {
  items: ShippingEstimateItem[]
}

export type ShippingEstimate = {
  shippingLabel: string
  shippingMethod: 'mondial_relay'
  shippingPriceCents: number
  totalWeightGrams: number
}

export async function createShippingEstimate(
  payload: ShippingEstimatePayload,
): Promise<ShippingEstimate> {
  const response = await fetch(`${env.apiBaseUrl}/api/orders/shipping-estimate`, {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      ...createAuthHeaders(),
    },
    method: 'POST',
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Connectez-vous pour estimer la livraison.')
    }

    throw new Error("La livraison n'a pas pu etre estimee.")
  }

  const responseBody = await readResponseBody(response)

  return normalizeShippingEstimateResponse(responseBody)
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

function normalizeShippingEstimateResponse(value: unknown): ShippingEstimate {
  if (!isRecord(value)) {
    throw new Error("La reponse livraison n'est pas exploitable.")
  }

  if (value.success === true && isRecord(value.data)) {
    return normalizeShippingEstimateResponse(value.data)
  }

  const shippingMethod = value.shippingMethod
  const shippingLabel = readStringValue(value, 'shippingLabel')
  const totalWeightGrams = readNumberValue(value, 'totalWeightGrams')
  const shippingPriceCents = readNumberValue(value, 'shippingPriceCents')

  if (
    shippingMethod !== 'mondial_relay' ||
    shippingLabel === null ||
    totalWeightGrams === null ||
    shippingPriceCents === null
  ) {
    throw new Error("La reponse livraison n'est pas exploitable.")
  }

  return {
    shippingLabel,
    shippingMethod,
    shippingPriceCents,
    totalWeightGrams,
  }
}

function readStringValue(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key]

  return typeof value === 'string' && value.length > 0 ? value : null
}

function readNumberValue(
  record: Record<string, unknown>,
  key: string,
): number | null {
  const value = record[key]

  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value
  }

  if (typeof value === 'string') {
    const parsedValue = Number(value)

    if (Number.isFinite(parsedValue) && parsedValue >= 0) {
      return parsedValue
    }
  }

  return null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
