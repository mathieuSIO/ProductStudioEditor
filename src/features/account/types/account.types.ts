import type { FinalPreviewUrls } from '../../../shared/utils/previewImages'

export type AccountProfile = {
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  country: string
  email: string
  firstName: string
  id: number
  lastName: string
  phone: string | null
  postalCode: string | null
}

export type UpdateAccountProfilePayload = {
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  country: string
  firstName: string
  lastName: string
  phone: string | null
  postalCode: string | null
}

export type UpdateAccountPasswordPayload = {
  currentPassword: string
  newPassword: string
}

export type ApiResponse<T> =
  | {
      data: T
      success: true
    }
  | {
      message: string
      success: false
    }

export type OrderStatus =
  | 'cancelled'
  | 'delivered'
  | 'draft'
  | 'in_production'
  | 'paid'
  | 'pending'
  | 'processing'
  | 'received'
  | 'shipped'
  | string

export type OrderCustomer = {
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  phone?: string | null
}

export type ShippingAddress = {
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  country?: string | null
  postalCode?: string | null
}

export type OrderShipment = {
  carrier?: string | null
  relayPointAddress?: string | null
  relayPointId?: string | null
  relayPointName?: string | null
  shippingLabel?: string | null
  shippingMethod?: string | null
  shippingPriceCents?: number | null
  status?: string | null
  totalWeightGrams?: number | null
  trackingNumber?: string | null
  trackingUrl?: string | null
}

export type OrderOptions = {
  professionalLogoReview?: boolean | null
  professionalLogoReviewPriceCents?: number | null
  productionLabel?: string | null
  productionPercentage?: number | null
  productionPriceCents?: number | null
}

export type OrderSummary = {
  createdAt?: string | null
  customer?: OrderCustomer | null
  customerEmail?: string | null
  customerFirstName?: string | null
  customerLastName?: string | null
  customerName?: string | null
  id: string
  orderNumber?: string | null
  status: OrderStatus
  totalAmount?: number | null
  totalCents?: number | null
  totalPriceCents?: number | null
}

export type OrderItemDetails = {
  customization?: Record<string, unknown> | null
  finalPreviewUrl?: string | null
  finalPreviewUrls?: FinalPreviewUrls | null
  id: string
  productId?: number | null
  priceTotal?: number | null
  productName: string
  quantity: number
  totalPriceCents?: number | null
  unitPrice?: number | null
  unitPriceCents?: number | null
}

export type OrderDetails = OrderSummary & {
  customerPhone?: string | null
  items: OrderItemDetails[]
  options?: OrderOptions | null
  shippingAddressLine1?: string | null
  shippingAddressLine2?: string | null
  shippingCity?: string | null
  shippingCountry?: string | null
  shippingPostalCode?: string | null
  shippingAddress?: ShippingAddress | null
  shipment?: OrderShipment | null
}
