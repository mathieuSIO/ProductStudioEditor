import { env } from '../../../shared/config/env'
import { createAuthHeaders } from '../../auth'

export type ValidatePromoCodePayload = {
  code: string
  orderSubtotalCents: number
}

export type PromoCodeValidation = {
  code: string
  discountedSubtotalCents: number
  discountCents: number
  id: number
  valid: true
}

export async function validatePromoCode(
  payload: ValidatePromoCodePayload,
): Promise<PromoCodeValidation> {
  const response = await fetch(`${env.apiBaseUrl}/api/promo-codes/validate`, {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      ...createAuthHeaders(),
    },
    method: 'POST',
  })
  const responseBody = await readResponseBody(response)

  if (!response.ok) {
    throw new Error(readErrorMessage(responseBody) ?? 'Ce code promo est invalide.')
  }

  return normalizePromoCodeValidation(responseBody)
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

function normalizePromoCodeValidation(value: unknown): PromoCodeValidation {
  if (!isRecord(value)) {
    throw new Error("La reponse du code promo n'est pas exploitable.")
  }

  if (value.success === true && isRecord(value.data)) {
    return normalizePromoCodeValidation(value.data)
  }

  const id = readNumberValue(value, 'id')
  const code = readStringValue(value, 'code')
  const discountCents = readNumberValue(value, 'discountCents')
  const discountedSubtotalCents = readNumberValue(
    value,
    'discountedSubtotalCents',
  )

  if (
    id === null ||
    code === null ||
    value.valid !== true ||
    discountCents === null ||
    discountedSubtotalCents === null
  ) {
    throw new Error("La reponse du code promo n'est pas exploitable.")
  }

  return {
    code,
    discountedSubtotalCents,
    discountCents,
    id,
    valid: true,
  }
}

function readErrorMessage(value: unknown): string | null {
  if (!isRecord(value)) {
    return null
  }

  if (typeof value.message === 'string' && value.message.trim().length > 0) {
    return value.message
  }

  return null
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

function readStringValue(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key]

  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
