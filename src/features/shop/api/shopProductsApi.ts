import { env } from '../../../shared/config/env'
import type { ShopProduct, ShopProductVariant } from '../types/shop.types'

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
  const normalizedProduct = normalizeShopProductResource(product)

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
    variants: normalizeShopProductVariants(value.variants),
  }
}

function normalizeShopProductResource(value: unknown): ShopProduct | null {
  if (!isRecord(value) || !isRecord(value.product)) {
    return normalizeShopProduct(value)
  }

  return normalizeShopProduct({
    ...value.product,
    variants: value.variants,
  })
}

function isActiveShopProduct(value: ShopProduct | null): value is ShopProduct {
  return value !== null && value.isActive
}

function normalizeShopProductVariants(value: unknown): ShopProductVariant[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map(normalizeShopProductVariant).filter(isShopProductVariant)
}

function normalizeShopProductVariant(value: unknown): ShopProductVariant | null {
  if (!isRecord(value)) {
    return null
  }

  const id = readNumber(value, 'id')
  const sizeLabel =
    readString(value, 'sizeLabel') ?? readString(value, 'size_label')
  const colorName =
    readString(value, 'colorName') ?? readString(value, 'color_name')
  const priceCents = readNullableNumberByKeys(value, 'priceCents', 'price_cents')
  const stockQuantity =
    readNumber(value, 'stockQuantity') ?? readNumber(value, 'stock_quantity')
  const isActive =
    readBoolean(value, 'isActive') ?? readBoolean(value, 'is_active')

  if (
    id === null ||
    sizeLabel === null ||
    colorName === null ||
    priceCents === undefined ||
    stockQuantity === null ||
    isActive === null
  ) {
    return null
  }

  return {
    colorHex:
      readNullableString(value, 'colorHex') ??
      readNullableString(value, 'color_hex'),
    colorName,
    id,
    isActive,
    priceCents,
    sizeLabel,
    stockQuantity,
  }
}

function isShopProductVariant(
  value: ShopProductVariant | null,
): value is ShopProductVariant {
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

function readNullableNumber(
  record: Record<string, unknown>,
  key: string,
): number | null | undefined {
  const value = record[key]

  if (value === null) {
    return null
  }

  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function readNullableNumberByKeys(
  record: Record<string, unknown>,
  firstKey: string,
  secondKey: string,
): number | null | undefined {
  const firstValue = readNullableNumber(record, firstKey)

  return firstValue === undefined ? readNullableNumber(record, secondKey) : firstValue
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
