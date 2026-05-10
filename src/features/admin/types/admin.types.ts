import type { OrderDetails, OrderItemDetails, OrderSummary } from '../../account'

export type AdminOrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'

export type AdminOrderSummary = OrderSummary & {
  items?: OrderItemDetails[]
}

export type AdminOrderDetails = OrderDetails

