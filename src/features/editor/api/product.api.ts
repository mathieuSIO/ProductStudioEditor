import { env } from '../../../shared/config/env'
import type {
  ProductCatalogColor,
  ProductCatalogItem,
  ProductCatalogReference,
} from '../types/product.types'

type ProductCatalogResponse = {
  data: ProductCatalogItem[]
  success: true
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === 'string' || value === null
}

function isNullableNumber(value: unknown): value is number | null {
  return typeof value === 'number' || value === null
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isProductCatalogColor(value: unknown): value is ProductCatalogColor {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    isNullableString(value.code) &&
    isNullableString(value.swatchHex)
  )
}

function isProductCatalogReference(
  value: unknown
): value is ProductCatalogReference {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'number' &&
    typeof value.referenceName === 'string' &&
    isNullableString(value.supplierName) &&
    isNullableString(value.supplierReference) &&
    isNullableNumber(value.grammageGsm) &&
    isNullableString(value.material) &&
    isNullableString(value.fit) &&
    isNullableString(value.description) &&
    typeof value.basePriceCents === 'number' &&
    isStringArray(value.sizes) &&
    Array.isArray(value.colors) &&
    value.colors.every(isProductCatalogColor)
  )
}

function isProductCatalogItem(value: unknown): value is ProductCatalogItem {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'number' &&
    typeof value.slug === 'string' &&
    typeof value.name === 'string' &&
    typeof value.type === 'string' &&
    isNullableString(value.category) &&
    Array.isArray(value.references) &&
    value.references.every(isProductCatalogReference)
  )
}

function isProductCatalogResponse(
  value: unknown
): value is ProductCatalogResponse {
  if (!isRecord(value)) {
    return false
  }

  return (
    value.success === true &&
    Array.isArray(value.data) &&
    value.data.every(isProductCatalogItem)
  )
}

function getProductsEndpoint(): string {
  if (!env.apiBaseUrl) {
    throw new Error('La configuration API est manquante: VITE_API_BASE_URL.')
  }

  return `${env.apiBaseUrl.replace(/\/$/, '')}/api/products`
}

export async function getProducts(
  signal?: AbortSignal
): Promise<ProductCatalogItem[]> {
  const response = await fetch(getProductsEndpoint(), {
    method: 'GET',
    signal,
  })

  if (!response.ok) {
    throw new Error(
      `Le chargement des produits a echoue avec le statut ${response.status}.`
    )
  }

  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    throw new Error('La reponse de l API produits est invalide.')
  }

  if (!isProductCatalogResponse(payload)) {
    throw new Error('La reponse de l API produits est invalide.')
  }

  return payload.data
}
