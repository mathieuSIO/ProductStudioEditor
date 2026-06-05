import type { OrderDetails, OrderItemDetails, OrderSummary } from '../../account'

export type AdminOrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'

export type AdminShippingStatus =
  | 'delivered'
  | 'failed'
  | 'label_created'
  | 'pending'
  | 'shipped'

export type UpdateAdminOrderShippingPayload = {
  status?: AdminShippingStatus
  trackingNumber?: string | null
  trackingUrl?: string | null
}

export type AdminOrderSummary = OrderSummary & {
  items?: OrderItemDetails[]
}

export type AdminOrderDetails = OrderDetails

export type AdminShopProduct = {
  createdAt: string
  description: string | null
  id: number
  imageStorageKey: string | null
  imageUrl: string | null
  isActive: boolean
  name: string
  priceCents: number
  slug: string
  updatedAt: string
}

export type AdminShopProductApiResponse = {
  created_at: string
  description: string | null
  id: number
  image_storage_key: string | null
  image_url: string | null
  is_active: boolean
  name: string
  price_cents: number
  slug: string
  updated_at: string
}

export type CreateAdminShopProductPayload = {
  description?: string | null
  imageStorageKey?: string | null
  imageUrl?: string | null
  isActive?: boolean
  name: string
  priceCents: number
  slug: string
}

export type UpdateAdminShopProductPayload = {
  description?: string | null
  imageStorageKey?: string | null
  imageUrl?: string | null
  isActive?: boolean
  name?: string
  priceCents?: number
  slug?: string
}

export type UploadShopProductImageResponse = {
  storageKey: string
  url: string
}
