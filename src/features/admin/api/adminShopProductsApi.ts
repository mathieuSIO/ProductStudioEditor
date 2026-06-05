import { env } from '../../../shared/config/env'
import type { ApiResponse } from '../../account'
import { createAuthHeaders } from '../../auth'
import type {
  AdminShopProduct,
  CreateAdminShopProductPayload,
  UpdateAdminShopProductPayload,
  UploadShopProductImageResponse,
} from '../types/admin.types'

export class AdminShopProductsApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AdminShopProductsApiError'
    this.status = status
  }
}

export async function fetchAdminShopProducts(): Promise<AdminShopProduct[]> {
  const products = await fetchAdminShopProductsResource<unknown>(
    '/api/admin/shop/products',
  )

  if (!Array.isArray(products)) {
    throw new Error('La liste des produits boutique est invalide.')
  }

  return products.map(normalizeShopProduct).filter(isAdminShopProduct)
}

export async function createAdminShopProduct(
  payload: CreateAdminShopProductPayload,
): Promise<AdminShopProduct> {
  const product = await fetchAdminShopProductsResource<unknown>(
    '/api/admin/shop/products',
    {
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    },
  )

  return normalizeShopProductOrThrow(product)
}

export async function updateAdminShopProduct(
  productId: number,
  payload: UpdateAdminShopProductPayload,
): Promise<AdminShopProduct> {
  const product = await fetchAdminShopProductsResource<unknown>(
    `/api/admin/shop/products/${encodeURIComponent(String(productId))}`,
    {
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
    },
  )

  return normalizeShopProductOrThrow(product)
}

export async function updateAdminShopProductStatus(
  productId: number,
  isActive: boolean,
): Promise<AdminShopProduct> {
  const product = await fetchAdminShopProductsResource<unknown>(
    `/api/admin/shop/products/${encodeURIComponent(String(productId))}/status`,
    {
      body: JSON.stringify({ isActive }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
    },
  )

  return normalizeShopProductOrThrow(product)
}

export async function uploadAdminShopProductImage(
  file: File,
): Promise<UploadShopProductImageResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const uploadedImage = await fetchAdminShopProductsResource<unknown>(
    '/api/admin/shop/products/image',
    {
      body: formData,
      method: 'POST',
    },
  )

  return normalizeUploadResponseOrThrow(uploadedImage)
}

export function resolveShopProductImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) {
    return null
  }

  if (imageUrl.startsWith('http')) {
    return imageUrl
  }

  if (imageUrl.startsWith('/uploads')) {
    return `${env.apiBaseUrl}${imageUrl}`
  }

  return imageUrl
}

async function fetchAdminShopProductsResource<T>(
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
    throw new AdminShopProductsApiError(
      'La reponse serveur est invalide.',
      response.status,
    )
  }

  if (!response.ok || !responseBody.success) {
    throw new AdminShopProductsApiError(
      response.status === 401
        ? 'Votre session a expire. Veuillez vous reconnecter.'
        : response.status === 403
          ? 'Acces admin refuse.'
          : responseBody.success
            ? 'La ressource produits boutique est indisponible.'
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

function normalizeShopProductOrThrow(value: unknown): AdminShopProduct {
  const product = normalizeShopProduct(value)

  if (!product) {
    throw new Error('Le produit boutique est invalide.')
  }

  return product
}

function normalizeShopProduct(value: unknown): AdminShopProduct | null {
  if (!isRecord(value)) {
    return null
  }

  const id = readNumber(value, 'id')
  const name = readString(value, 'name')
  const slug = readString(value, 'slug')
  const priceCents =
    readNumber(value, 'priceCents') ?? readNumber(value, 'price_cents')
  const isActive =
    readBoolean(value, 'isActive') ?? readBoolean(value, 'is_active')
  const createdAt =
    readString(value, 'createdAt') ?? readString(value, 'created_at')
  const updatedAt =
    readString(value, 'updatedAt') ?? readString(value, 'updated_at')

  if (
    id === null ||
    name === null ||
    slug === null ||
    priceCents === null ||
    isActive === null ||
    createdAt === null ||
    updatedAt === null
  ) {
    return null
  }

  return {
    createdAt,
    description: readNullableString(value, 'description'),
    id,
    imageUrl:
      readNullableString(value, 'imageUrl') ??
      readNullableString(value, 'image_url'),
    isActive,
    name,
    priceCents,
    slug,
    updatedAt,
  }
}

function normalizeUploadResponseOrThrow(
  value: unknown,
): UploadShopProductImageResponse {
  if (!isRecord(value)) {
    throw new Error("La reponse d'upload image est invalide.")
  }

  const url = readString(value, 'url')
  const storageKey =
    readString(value, 'storageKey') ?? readString(value, 'storage_key')

  if (url === null || storageKey === null) {
    throw new Error("La reponse d'upload image est invalide.")
  }

  return { storageKey, url }
}

function isAdminShopProduct(
  value: AdminShopProduct | null,
): value is AdminShopProduct {
  return value !== null
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
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
