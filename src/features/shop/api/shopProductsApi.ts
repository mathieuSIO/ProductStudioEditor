import { env } from '../../../shared/config/env'
import type { ShopProduct } from '../types/shop.types'

export async function fetchShopProducts(
  signal?: AbortSignal,
): Promise<ShopProduct[]> {
  const products = await fetchShopResource<unknown>('/api/shop/products', signal)

  if (!Array.isArray(products)) {
    throw new Error('Impossible de charger les produits boutique.')
  }

  return products.map(normalizeShopProduct).filter(isActiveShopProduct)
}

export async function fetchShopProductBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<ShopProduct> {
  const product = await fetchShopResource<unknown>(
    `/api/shop/products/${encodeURIComponent(slug)}`,
    signal,
  )
  const normalizedProduct = normalizeShopProduct(product)

  if (!normalizedProduct) {
    throw new Error('Produit introuvable ou indisponible.')
  }

  return normalizedProduct
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

async function fetchShopResource<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'GET',
    signal,
  })
  const responseBody = await readResponseBody(response)

  if (!isApiResponse<T>(responseBody)) {
    throw new Error('La reponse boutique est invalide.')
  }

  if (!response.ok || !responseBody.success) {
    throw new Error(
      responseBody.success
        ? 'La ressource boutique est indisponible.'
        : responseBody.message,
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

function normalizeShopProduct(value: unknown): ShopProduct | null {
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
    imageStorageKey:
      readNullableString(value, 'imageStorageKey') ??
      readNullableString(value, 'image_storage_key'),
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

function isActiveShopProduct(value: ShopProduct | null): value is ShopProduct {
  return value !== null && value.isActive
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
