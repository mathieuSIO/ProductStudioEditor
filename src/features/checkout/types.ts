import type {
  Cart,
  CartColorSnapshot,
  CartDesignSnapshot,
  CartItemPricingSnapshot,
  CartQuantitiesBySize,
  CartTotals,
} from '../cart'
import type { ProductId } from '../editor/types'

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

export type ProductionOption = 'premium' | 'rapide' | 'standard'

export type CheckoutDraft = {
  cart: Cart
  customerInfo: CheckoutFormData
  productionOption: ProductionOption
  totals: CartTotals
}

export type CreateOrderPayload = {
  order: CreateOrderPayloadOrder
  items: CreateOrderPayloadItem[]
  promoCode?: string | null
}

export type CreateOrderPayloadOrder = {
  customerEmail: string
  customerFirstName?: string | null
  customerLastName?: string | null
  customerPhone?: string | null
  professionalLogoReviewEnabled: boolean
  productionOption: ProductionOption
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
  customization?: CreateOrderCustomization | null
  finalPreviewUrl?: string | null
}

export type CreateOrderCustomization = {
  design: CartDesignSnapshot
  pricing: CartItemPricingSnapshot
  product: CreateOrderCustomizationProduct
}

export type CreateOrderCustomizationProduct = {
  catalogProductId: number
  catalogReferenceId?: number
  color: CartColorSnapshot
  id: ProductId
  name: string
  quantities: CartQuantitiesBySize
  textileUnitPrice?: number
}
