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
