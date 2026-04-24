import type { Cart, CartTotals } from '../cart'

export type CheckoutFormData = {
  comment: string
  company: string
  email: string
  firstName: string
  lastName: string
  phone: string
}

export type CheckoutDraft = {
  cart: Cart
  customerInfo: CheckoutFormData
  totals: CartTotals
}
