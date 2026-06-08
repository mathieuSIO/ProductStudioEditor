import { professionalLogoReviewPrice } from '../constants'
import { isShopCartItem, isStudioCartItem } from '../types'
import type { Cart, CartItem, CartTotals } from '../types'

export function calculateCartTotals(cart: Cart): CartTotals {
  const subtotal = cart.items.reduce(
    (total, item) => total + calculateCartItemTotal(item),
    0,
  )
  const hasStudioItem = cart.items.some(isStudioCartItem)
  const optionsTotal = cart.options.professionalLogoReview && hasStudioItem
    ? professionalLogoReviewPrice
    : 0

  return {
    optionsTotal,
    subtotal,
    total: subtotal + optionsTotal,
  }
}

function calculateCartItemTotal(item: CartItem): number {
  if (isShopCartItem(item)) {
    return (item.unitPriceCents * item.quantity) / 100
  }

  return item.pricing.grandTotal
}
