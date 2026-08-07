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

export type RelaySelectionStatus =
  | 'not_required'
  | 'pending'
  | 'selected'

export type RelayPoint = {
  id: string
  name: string
  addressLine1: string
  addressLine2: string | null
  postalCode: string
  city: string
  country: string
  latitude: number | null
  longitude: number | null
}

export type RelaySelectionDetails = {
  orderId: number
  orderStatus: string
  paymentStatus: string
  shippingMethod: string
  relaySelectionStatus: RelaySelectionStatus
  relayPoint: RelayPoint | null
}

export type SelectRelayPointPayload = {
  checkoutSessionId: string
  relayPoint: {
    id: string
    country: string
  }
}

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

export type CreateOrderPayloadItem =
  | CreateOrderShopPayloadItem
  | CreateOrderStudioPayloadItem

export type CreateOrderStudioPayloadItem = {
  customization: CreateOrderCustomization
  finalPreviewUrl?: string | null
  itemType: 'studio'
  productId: number
  productName: string
  quantity: number
  unitPriceCents: number
}

export type CreateOrderShopPayloadItem = {
  customization: null
  finalPreviewUrl: null
  itemType: 'shop'
  productName: string
  quantity: number
  shopProductId: number
  shopProductVariantId: number
  unitPriceCents: number
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
