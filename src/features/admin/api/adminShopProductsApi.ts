import { env } from '../../../shared/config/env'
import type { ApiResponse } from '../../account'
import { createAuthHeaders } from '../../auth'
import type {
  AdminShopProduct,
  AdminShopProductVariant,
  CreateAdminShopProductPayload,
  CreateAdminShopProductVariantPayload,
  UpdateAdminShopProductPayload,
  UpdateAdminShopProductVariantPayload,
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

export async function fetchAdminShopProductVariants(
  productId: number,
): Promise<AdminShopProductVariant[]> {
  const variants = await fetchAdminShopProductsResource<unknown>(
    `/api/admin/shop/products/${encodeURIComponent(String(productId))}/variants`,
  )

  if (!Array.isArray(variants)) {
    throw new Error('La liste des variantes boutique est invalide.')
  }

  return variants.map(normalizeShopProductVariant).filter(isAdminShopProductVariant)
}

export async function createAdminShopProductVariant(
  productId: number,
  payload: CreateAdminShopProductVariantPayload,
): Promise<AdminShopProductVariant> {
  const variant = await fetchAdminShopProductsResource<unknown>(
    `/api/admin/shop/products/${encodeURIComponent(String(productId))}/variants`,
    {
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    },
  )

  return normalizeShopProductVariantOrThrow(variant)
}

export async function updateAdminShopProductVariant(
  productId: number,
  variantId: number,
  payload: UpdateAdminShopProductVariantPayload,
): Promise<AdminShopProductVariant> {
  const variant = await fetchAdminShopProductsResource<unknown>(
    `/api/admin/shop/products/${encodeURIComponent(String(productId))}/variants/${encodeURIComponent(String(variantId))}`,
    {
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
    },
  )

  return normalizeShopProductVariantOrThrow(variant)
}

export async function updateAdminShopProductVariantStatus(
  productId: number,
  variantId: number,
  isActive: boolean,
): Promise<AdminShopProductVariant> {
  const variant = await fetchAdminShopProductsResource<unknown>(
    `/api/admin/shop/products/${encodeURIComponent(String(productId))}/variants/${encodeURIComponent(String(variantId))}/status`,
    {
      body: JSON.stringify({ isActive }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
    },
  )

  return normalizeShopProductVariantOrThrow(variant)
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

function normalizeShopProductVariantOrThrow(
  value: unknown,
): AdminShopProductVariant {
  const variant = normalizeShopProductVariant(value)

  if (!variant) {
    throw new Error('La variante boutique est invalide.')
  }

  return variant
}

function normalizeShopProductVariant(
  value: unknown,
): AdminShopProductVariant | null {
  if (!isRecord(value)) {
    return null
  }

  const id = readNumber(value, 'id')
  const shopProductId =
    readNumber(value, 'shopProductId') ?? readNumber(value, 'shop_product_id')
  const sizeLabel =
    readString(value, 'sizeLabel') ?? readString(value, 'size_label')
  const colorName =
    readString(value, 'colorName') ?? readString(value, 'color_name')
  const stockQuantity =
    readNumber(value, 'stockQuantity') ?? readNumber(value, 'stock_quantity')
  const isActive =
    readBoolean(value, 'isActive') ?? readBoolean(value, 'is_active')
  const createdAt =
    readString(value, 'createdAt') ?? readString(value, 'created_at')
  const updatedAt =
    readString(value, 'updatedAt') ?? readString(value, 'updated_at')

  if (
    id === null ||
    shopProductId === null ||
    sizeLabel === null ||
    colorName === null ||
    stockQuantity === null ||
    isActive === null ||
    createdAt === null ||
    updatedAt === null
  ) {
    return null
  }

  return {
    colorHex:
      readNullableString(value, 'colorHex') ??
      readNullableString(value, 'color_hex'),
    colorName,
    createdAt,
    id,
    isActive,
    priceCents:
      readNumber(value, 'priceCents') ?? readNumber(value, 'price_cents'),
    shopProductId,
    sizeLabel,
    sku: readNullableString(value, 'sku'),
    stockQuantity,
    updatedAt,
  }
}

function isAdminShopProduct(
  value: AdminShopProduct | null,
): value is AdminShopProduct {
  return value !== null
}

function isAdminShopProductVariant(
  value: AdminShopProductVariant | null,
): value is AdminShopProductVariant {
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
