import { env } from '../../../shared/config/env'
import { createAuthHeaders } from '../../auth'

export const pendingCheckoutOrderIdStorageKey = 'pendingOrderId'
export const pendingCheckoutCustomerFirstNameStorageKey =
  'pendingCheckoutCustomerFirstName'

export type CreateCheckoutSessionResponse = {
  checkoutUrl: string
}

export type CreateCheckoutResponse = {
  checkoutUrl: string
  orderId: number
  totalPriceCents?: number
}

export async function createCheckoutSession(
  orderId: number,
): Promise<CreateCheckoutSessionResponse> {
  const response = await fetch(
    `${env.apiBaseUrl}/api/payments/checkout-session`,
    {
      body: JSON.stringify({ orderId }),
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeaders(),
      },
      method: 'POST',
    },
  )

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Connectez-vous pour finaliser votre paiement.')
    }

    throw new Error(
      "La session de paiement Stripe n'a pas pu etre creee.",
    )
  }

  const responseBody = await readResponseBody(response)

  return normalizeCreateCheckoutSessionResponse(responseBody)
}

export async function createCheckout(
  payload: unknown,
): Promise<CreateCheckoutResponse> {
  const response = await fetch(`${env.apiBaseUrl}/api/payments/checkout`, {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      ...createAuthHeaders(),
    },
    method: 'POST',
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Connectez-vous pour finaliser votre paiement.')
    }

    if (response.status === 400) {
      throw new Error("La commande invitee est disponible pour la boutique. Connectez-vous pour finaliser un panier studio.")
    }

    throw new Error(
      "La session de paiement Stripe n'a pas pu etre creee.",
    )
  }

  const responseBody = await readResponseBody(response)

  return normalizeCreateCheckoutResponse(responseBody)
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

function normalizeCreateCheckoutSessionResponse(
  value: unknown,
): CreateCheckoutSessionResponse {
  if (!isRecord(value)) {
    throw new Error("La reponse Stripe ne contient pas d'URL de paiement.")
  }

  if (value.success === true && isRecord(value.data)) {
    return normalizeCreateCheckoutSessionResponse(value.data)
  }

  const checkoutUrl = readStringValue(value, 'checkoutUrl')

  if (checkoutUrl === null) {
    throw new Error("La reponse Stripe ne contient pas d'URL de paiement.")
  }

  return { checkoutUrl }
}

function normalizeCreateCheckoutResponse(value: unknown): CreateCheckoutResponse {
  if (!isRecord(value)) {
    throw new Error("La reponse Stripe ne contient pas d'URL de paiement.")
  }

  if (value.success === true && isRecord(value.data)) {
    return normalizeCreateCheckoutResponse(value.data)
  }

  const checkoutUrl = readStringValue(value, 'checkoutUrl')
  const orderId = readNumberValue(value, 'orderId')
  const totalPriceCents = readNumberValue(value, 'totalPriceCents')

  if (checkoutUrl === null || orderId === null) {
    throw new Error("La reponse Stripe ne contient pas d'URL de paiement.")
  }

  return {
    checkoutUrl,
    orderId,
    ...(totalPriceCents !== null ? { totalPriceCents } : {}),
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

  return typeof value === 'number' && Number.isInteger(value) && value > 0
    ? value
    : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
