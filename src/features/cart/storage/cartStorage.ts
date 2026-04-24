import { cartStorageKey, emptyCart } from '../constants'
import type { Cart } from '../types'

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

    return isCart(parsedCart) ? parsedCart : createEmptyCart()
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

function isCart(value: unknown): value is Cart {
  if (!isRecord(value)) {
    return false
  }

  return Array.isArray(value.items) && isCartOptions(value.options)
}

function isCartOptions(value: unknown) {
  if (!isRecord(value)) {
    return false
  }

  return typeof value.professionalLogoReview === 'boolean'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
