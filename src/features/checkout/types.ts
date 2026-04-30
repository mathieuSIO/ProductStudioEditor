import type { Cart, CartTotals } from '../cart'

export type CheckoutFormData = {
  comment: string
  company: string
  email: string
  firstName: string
  lastName: string
  pays: string
  ville: string
  codePostal: string
  adresse: string
  phone: string
}

export type CheckoutDraft = {
  cart: Cart
  customerInfo: CheckoutFormData
  totals: CartTotals
}

export type CreateOrderPayload = {
  order: CreateOrderPayloadOrder
  items: CreateOrderPayloadItem[]
}

export type CreateOrderPayloadOrder = {
  customerEmail: string
  customerFirstName?: string | null
  customerLastName?: string | null
  customerPhone?: string | null
  shippingAddressLine1?: string | null
  shippingAddressLine2?: string | null
  shippingPostalCode?: string | null
  shippingCity?: string | null
  shippingCountry?: string | null
}

export type CreateOrderPayloadItem = {
  productId: number
  productName: string
  quantity: number
  unitPriceCents: number
  customization?: unknown | null
  finalPreviewUrl?: string | null
}
