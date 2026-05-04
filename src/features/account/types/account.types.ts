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
  shippingAddressLine1?: string | null
  shippingAddressLine2?: string | null
  shippingCity?: string | null
  shippingCountry?: string | null
  shippingPostalCode?: string | null
  shippingAddress?: ShippingAddress | null
}
