import { cartStorageKey, emptyCart } from '../constants'
import type { Cart, CartItem, ShopCartItem, StudioCartItem } from '../types'

export function loadCart(): Cart {
  if (!isLocalStorageAvailable()) {
    return createEmptyCart()
  }

  const serializedCart = window.localStorage.getItem(cartStorageKey)

  if (!serializedCart) {
    return createEmptyCart()
  }

  try {
    const parsedCart: unknown = JSON.parse(serializedCart)

    return normalizeCart(parsedCart) ?? createEmptyCart()
  } catch {
    return createEmptyCart()
  }
}

export function saveCart(cart: Cart) {
  if (!isLocalStorageAvailable()) {
    return
  }

  window.localStorage.setItem(cartStorageKey, JSON.stringify(cart))
}

export function createEmptyCart(): Cart {
  return {
    items: [],
    options: {
      ...emptyCart.options,
    },
  }
}

function isLocalStorageAvailable() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function normalizeCart(value: unknown): Cart | null {
  if (!isRecord(value)) {
    return null
  }

  if (!Array.isArray(value.items) || !isCartOptions(value.options)) {
    return null
  }

  return {
    items: value.items.map(normalizeCartItem).filter(isCartItem),
    options: value.options,
  }
}

function normalizeCartItem(value: unknown): CartItem | null {
  if (!isRecord(value)) {
    return null
  }

  if (value.kind === 'shop') {
    return isShopCartItemRecord(value) ? value : null
  }

  return isLegacyStudioCartItemRecord(value)
    ? {
        ...(value as Omit<StudioCartItem, 'kind'>),
        kind: 'studio',
      }
    : null
}

function isCartItem(value: CartItem | null): value is CartItem {
  return value !== null
}

function isCartOptions(value: unknown): value is Cart['options'] {
  if (!isRecord(value)) {
    return false
  }

  return typeof value.professionalLogoReview === 'boolean'
}

function isShopCartItemRecord(
  value: Record<string, unknown>,
): value is ShopCartItem {
  return (
    value.kind === 'shop' &&
    typeof value.id === 'string' &&
    typeof value.shopProductId === 'number' &&
    typeof value.shopProductVariantId === 'number' &&
    typeof value.name === 'string' &&
    typeof value.slug === 'string' &&
    typeof value.sizeLabel === 'string' &&
    typeof value.colorName === 'string' &&
    (typeof value.colorHex === 'string' || value.colorHex === null) &&
    (typeof value.imageUrl === 'string' || value.imageUrl === null) &&
    typeof value.quantity === 'number' &&
    Number.isFinite(value.quantity) &&
    typeof value.unitPriceCents === 'number' &&
    Number.isFinite(value.unitPriceCents) &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  )
}

function isLegacyStudioCartItemRecord(
  value: Record<string, unknown>,
): value is Omit<StudioCartItem, 'kind'> {
  return (
    (value.kind === undefined || value.kind === 'studio') &&
    typeof value.id === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string' &&
    isRecord(value.product) &&
    isRecord(value.color) &&
    isRecord(value.design) &&
    isRecord(value.pricing) &&
    isRecord(value.quantities)
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
