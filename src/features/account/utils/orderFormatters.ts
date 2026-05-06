import { formatEuro } from '../../../shared/formatters/formatEuro'
import type {
  OrderDetails,
  OrderItemDetails,
  OrderSummary,
} from '../types/account.types'

const frenchDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

export function compareOrdersByCreatedAtDesc(
  firstOrder: OrderSummary,
  secondOrder: OrderSummary,
) {
  return (
    getSortableDateValue(secondOrder.createdAt) -
    getSortableDateValue(firstOrder.createdAt)
  )
}

export function formatOrderReference(order: OrderSummary) {
  return order.orderNumber ?? `Commande ${order.id}`
}

export function formatCustomerName(order: OrderSummary) {
  const customerName = order.customerName ?? order.customer?.name

  if (customerName) {
    return customerName
  }

  const firstName = order.customer?.firstName ?? order.customerFirstName
  const lastName = order.customer?.lastName ?? order.customerLastName
  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  return fullName.length > 0 ? fullName : 'Client MPM'
}

export function formatCustomerEmail(order: OrderSummary) {
  return order.customerEmail ?? order.customer?.email ?? 'Email non renseigné'
}

export function formatOrderDate(value?: string | null) {
  if (!value) {
    return 'Date non renseignée'
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? 'Date non renseignée'
    : frenchDateFormatter.format(date)
}

export function formatOrderTotal(order: OrderSummary) {
  if (typeof order.totalPriceCents === 'number') {
    return formatEuro(order.totalPriceCents / 100)
  }

  if (typeof order.totalCents === 'number') {
    return formatEuro(order.totalCents / 100)
  }

  if (typeof order.totalAmount === 'number') {
    return formatEuro(order.totalAmount)
  }

  return 'Total à confirmer'
}

export function formatShippingAddress(order: OrderDetails) {
  const address = order.shippingAddress

  if (!address) {
    return 'Adresse non renseignée'
  }

  const cityLine = [address.postalCode, address.city].filter(Boolean).join(' ')
  const lines = [
    address.addressLine1,
    address.addressLine2,
    cityLine,
    address.country,
  ].filter(Boolean)

  return lines.length > 0 ? lines.join(', ') : 'Adresse non renseignée'
}

export function formatItemUnitPrice(item: OrderItemDetails) {
  if (typeof item.unitPriceCents === 'number') {
    return formatEuro(item.unitPriceCents / 100)
  }

  if (typeof item.unitPrice === 'number') {
    return formatEuro(item.unitPrice)
  }

  return 'Prix à confirmer'
}

export function formatItemTotal(item: OrderItemDetails) {
  if (typeof item.totalPriceCents === 'number') {
    return formatEuro(item.totalPriceCents / 100)
  }

  if (typeof item.priceTotal === 'number') {
    return formatEuro(item.priceTotal)
  }

  if (typeof item.unitPriceCents === 'number') {
    return formatEuro((item.unitPriceCents * item.quantity) / 100)
  }

  if (typeof item.unitPrice === 'number') {
    return formatEuro(item.unitPrice * item.quantity)
  }

  return 'Total à confirmer'
}

function getSortableDateValue(value?: string | null) {
  if (!value) {
    return 0
  }

  const timestamp = new Date(value).getTime()

  return Number.isNaN(timestamp) ? 0 : timestamp
}
