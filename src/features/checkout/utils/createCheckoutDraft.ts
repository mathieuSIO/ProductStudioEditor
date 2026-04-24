import { calculateCartTotals, type Cart } from '../../cart'
import type { CheckoutDraft, CheckoutFormData } from '../types'

export function createCheckoutDraft(
  cart: Cart,
  customerInfo: CheckoutFormData,
): CheckoutDraft {
  return {
    cart,
    customerInfo: {
      comment: customerInfo.comment.trim(),
      company: customerInfo.company.trim(),
      email: customerInfo.email.trim(),
      firstName: customerInfo.firstName.trim(),
      lastName: customerInfo.lastName.trim(),
      phone: customerInfo.phone.trim(),
    },
    totals: calculateCartTotals(cart),
  }
}
