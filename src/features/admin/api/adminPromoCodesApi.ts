import { env } from '../../../shared/config/env'
import { createAuthHeaders } from '../../auth'

export type PromoCodeDiscountType = 'fixed_amount' | 'percentage'

export type AdminPromoCode = {
  code: string
  currentUses: number
  discountType: PromoCodeDiscountType
  discountValue: number
  expiresAt: string | null
  id: number
  isActive: boolean
  maxUses: number | null
  minimumOrderCents: number
  startsAt: string | null
}

export type CreateAdminPromoCodePayload = {
  code: string
  discountType: PromoCodeDiscountType
  discountValue: number
  expiresAt: string | null
  isActive: boolean
  maxUses: number | null
  minimumOrderCents: number
  startsAt: string | null
}

export class AdminPromoCodesApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AdminPromoCodesApiError'
    this.status = status
  }
}

export async function fetchAdminPromoCodes(): Promise<AdminPromoCode[]> {
  const promoCodes = await fetchAdminPromoCodeResource<unknown>(
    '/api/admin/promo-codes',
  )

  if (!Array.isArray(promoCodes)) {
    throw new Error('La liste des codes promo est invalide.')
  }

  return promoCodes.map(normalizePromoCode).filter(isAdminPromoCode)
}

export async function createAdminPromoCode(
  payload: CreateAdminPromoCodePayload,
): Promise<AdminPromoCode> {
  const promoCode = await fetchAdminPromoCodeResource<unknown>(
    '/api/admin/promo-codes',
    {
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    },
  )

  return normalizePromoCodeOrThrow(promoCode)
}

export async function updateAdminPromoCodeStatus(
  promoCodeId: number,
  isActive: boolean,
): Promise<AdminPromoCode> {
  const promoCode = await fetchAdminPromoCodeResource<unknown>(
    `/api/admin/promo-codes/${encodeURIComponent(String(promoCodeId))}/status`,
    {
      body: JSON.stringify({ isActive }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
    },
  )

  return normalizePromoCodeOrThrow(promoCode)
}

async function fetchAdminPromoCodeResource<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      ...createAuthHeaders(),
      ...init.headers,
    },
  })
  const responseBody = await readResponseBody(response)

  if (!isApiResponse<T>(responseBody)) {
    throw new AdminPromoCodesApiError(
      'La reponse serveur est invalide.',
      response.status,
    )
  }

  if (!response.ok || !responseBody.success) {
    throw new AdminPromoCodesApiError(
      responseBody.success
        ? 'La ressource codes promo est indisponible.'
        : responseBody.message,
      response.status,
    )
  }

  return responseBody.data
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

function normalizePromoCodeOrThrow(value: unknown): AdminPromoCode {
  const promoCode = normalizePromoCode(value)

  if (!promoCode) {
    throw new Error('Le code promo est invalide.')
  }

  return promoCode
}

function normalizePromoCode(value: unknown): AdminPromoCode | null {
  if (!isRecord(value)) {
    return null
  }

  const id = readNumber(value, 'id')
  const code = readString(value, 'code')
  const discountType = readDiscountType(value)
  const discountValue =
    readNumber(value, 'discountValue') ?? readNumber(value, 'discount_value')
  const minimumOrderCents =
    readNumber(value, 'minimumOrderCents') ??
    readNumber(value, 'minimum_order_cents') ??
    0
  const currentUses =
    readNumber(value, 'currentUses') ?? readNumber(value, 'current_uses') ?? 0
  const isActive =
    readBoolean(value, 'isActive') ?? readBoolean(value, 'is_active')

  if (
    id === null ||
    code === null ||
    discountType === null ||
    discountValue === null ||
    isActive === null
  ) {
    return null
  }

  return {
    code,
    currentUses,
    discountType,
    discountValue,
    expiresAt: readNullableString(value, 'expiresAt') ?? readNullableString(value, 'expires_at'),
    id,
    isActive,
    maxUses: readNumber(value, 'maxUses') ?? readNumber(value, 'max_uses'),
    minimumOrderCents,
    startsAt: readNullableString(value, 'startsAt') ?? readNullableString(value, 'starts_at'),
  }
}

function readDiscountType(
  record: Record<string, unknown>,
): PromoCodeDiscountType | null {
  const value = readString(record, 'discountType') ?? readString(record, 'discount_type')

  if (value === 'percentage' || value === 'fixed_amount') {
    return value
  }

  return null
}

function isAdminPromoCode(
  value: AdminPromoCode | null,
): value is AdminPromoCode {
  return value !== null
}

function isApiResponse<T>(value: unknown): value is
  | {
      data: T
      success: true
    }
  | {
      message: string
      success: false
    } {
  if (!isRecord(value)) {
    return false
  }

  if (value.success === true) {
    return 'data' in value
  }

  return value.success === false && typeof value.message === 'string'
}

function readBoolean(
  record: Record<string, unknown>,
  key: string,
): boolean | null {
  const value = record[key]

  return typeof value === 'boolean' ? value : null
}

function readNumber(
  record: Record<string, unknown>,
  key: string,
): number | null {
  const value = record[key]

  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function readNullableString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key]

  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function readString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key]

  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
