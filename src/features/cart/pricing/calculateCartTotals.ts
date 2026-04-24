import { professionalLogoReviewPrice } from '../constants'
import type { Cart, CartTotals } from '../types'

export function calculateCartTotals(cart: Cart): CartTotals {
  const subtotal = cart.items.reduce(
    (total, item) => total + item.pricing.grandTotal,
    0,
  )
  const optionsTotal = cart.options.professionalLogoReview
    ? professionalLogoReviewPrice
    : 0

  return {
    optionsTotal,
    subtotal,
    total: subtotal + optionsTotal,
  }
}
