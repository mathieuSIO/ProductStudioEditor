import { env } from '../../../shared/config/env'
import type {
  ApiResponse,
  OrderCustomer,
  OrderDetails,
  OrderItemDetails,
  OrderSummary,
  OrderStatus,
  ShippingAddress,
} from '../types/account.types'

export async function fetchUserOrders(): Promise<OrderSummary[]> {
  const orders = await fetchAccountResource<unknown>('/api/me/orders')

  if (!Array.isArray(orders)) {
    throw new Error('La liste des commandes est invalide.')
  }

  return orders.map(normalizeOrderSummary).filter(isOrderSummary)
}

export async function fetchUserOrderDetails(
  orderId: string,
): Promise<OrderDetails> {
  const order = await fetchAccountResource<unknown>(
    `/api/me/orders/${encodeURIComponent(orderId)}`,
  )
  const normalizedOrder = normalizeOrderDetails(order)

  if (!normalizedOrder) {
    throw new Error('La commande demandée est introuvable.')
  }

  return normalizedOrder
}

async function fetchAccountResource<T>(path: string): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`)
  const responseBody: unknown = await response.json()

  if (!isApiResponse<T>(responseBody)) {
    throw new Error('La réponse serveur est invalide.')
  }

  if (!response.ok || !responseBody.success) {
    throw new Error(
      responseBody.success
        ? 'La ressource demandée est indisponible.'
        : responseBody.message,
    )
  }

  return responseBody.data
}

function normalizeOrderDetails(value: unknown): OrderDetails | null {
  const summary = normalizeOrderSummary(value)

  if (!summary || !isRecord(value)) {
    return null
  }

  const rawItems =
    readArray(value, 'items') ?? readArray(value, 'orderItems') ?? []
  const rawShippingAddress =
    readRecord(value, 'shippingAddress') ??
    readRecord(value, 'shipping_address') ??
    value
  const shippingAddress = normalizeShippingAddress(rawShippingAddress)

  return {
    ...summary,
    customerPhone:
      readString(value, 'customerPhone') ?? readString(value, 'customer_phone'),
    items: rawItems
      .map((rawItem, index) => normalizeOrderItem(rawItem, index))
      .filter(isOrderItemDetails),
    shippingAddress,
    shippingAddressLine1: shippingAddress?.addressLine1,
    shippingAddressLine2: shippingAddress?.addressLine2,
    shippingCity: shippingAddress?.city,
    shippingCountry: shippingAddress?.country,
    shippingPostalCode: shippingAddress?.postalCode,
  }
}

function normalizeOrderSummary(value: unknown): OrderSummary | null {
  if (!isRecord(value)) {
    return null
  }

  const id = readStringValue(value, 'id') ?? readStringValue(value, 'orderId')
  const status = readString(value, 'status') ?? 'pending'
  const customerFirstName =
    readString(value, 'customerFirstName') ??
    readString(value, 'customer_first_name')
  const customerLastName =
    readString(value, 'customerLastName') ??
    readString(value, 'customer_last_name')
  const customerEmail =
    readString(value, 'customerEmail') ?? readString(value, 'customer_email')
  const totalPriceCents =
    readNumber(value, 'totalPriceCents') ??
    readNumber(value, 'total_price_cents')

  if (!id) {
    return null
  }

  return {
    createdAt: readString(value, 'createdAt') ?? readString(value, 'created_at'),
    customer: normalizeCustomer(readRecord(value, 'customer'), {
      email: customerEmail,
      firstName: customerFirstName,
      lastName: customerLastName,
    }),
    customerEmail,
    customerFirstName,
    customerLastName,
    customerName:
      readString(value, 'customerName') ??
      readString(value, 'customer_name') ??
      formatCustomerName(customerFirstName, customerLastName),
    id,
    orderNumber:
      readString(value, 'orderNumber') ?? readString(value, 'order_number'),
    status: status as OrderStatus,
    totalAmount:
      readNumber(value, 'totalAmount') ?? readNumber(value, 'total_amount'),
    totalCents:
      readNumber(value, 'totalCents') ??
      totalPriceCents ??
      readNumber(value, 'total_cents'),
    totalPriceCents,
  }
}

function normalizeOrderItem(
  value: unknown,
  index: number,
): OrderItemDetails | null {
  if (!isRecord(value)) {
    return null
  }

  const productId =
    readNumber(value, 'productId') ?? readNumber(value, 'product_id')
  const id =
    readStringValue(value, 'id') ??
    readStringValue(value, 'orderItemId') ??
    readStringValue(value, 'order_item_id') ??
    (typeof productId === 'number' ? `product-${productId}-${index}` : null) ??
    `item-${index}`
  const productName =
    readString(value, 'productName') ?? readString(value, 'product_name')
  const quantity = readNumber(value, 'quantity') ?? 1

  if (!productName) {
    return null
  }

  return {
    customization: readRecord(value, 'customization'),
    finalPreviewUrl:
      readString(value, 'finalPreviewUrl') ??
      readString(value, 'final_preview_url'),
    id,
    productId,
    priceTotal:
      readNumber(value, 'priceTotal') ?? readNumber(value, 'price_total'),
    productName,
    quantity,
    totalPriceCents:
      readNumber(value, 'totalPriceCents') ??
      readNumber(value, 'total_price_cents'),
    unitPrice:
      readNumber(value, 'unitPrice') ?? readNumber(value, 'unit_price'),
    unitPriceCents:
      readNumber(value, 'unitPriceCents') ??
      readNumber(value, 'unit_price_cents'),
  }
}

function normalizeCustomer(
  value: Record<string, unknown> | null,
  fallback: OrderCustomer = {},
): OrderCustomer | null {
  if (!value && !hasCustomerFallback(fallback)) {
    return null
  }

  return {
    email: value ? readString(value, 'email') ?? fallback.email : fallback.email,
    firstName: value
      ? readString(value, 'firstName') ??
        readString(value, 'first_name') ??
        fallback.firstName
      : fallback.firstName,
    lastName: value
      ? readString(value, 'lastName') ??
        readString(value, 'last_name') ??
        fallback.lastName
      : fallback.lastName,
    name: value ? readString(value, 'name') ?? fallback.name : fallback.name,
    phone: value ? readString(value, 'phone') ?? fallback.phone : fallback.phone,
  }
}

function normalizeShippingAddress(
  value: Record<string, unknown> | null,
): ShippingAddress | null {
  if (!value) {
    return null
  }

  return {
    addressLine1:
      readString(value, 'addressLine1') ??
      readString(value, 'shippingAddressLine1') ??
      readString(value, 'shipping_address_line1') ??
      readString(value, 'address_line_1') ??
      readString(value, 'shipping_address_line_1'),
    addressLine2:
      readString(value, 'addressLine2') ??
      readString(value, 'shippingAddressLine2') ??
      readString(value, 'shipping_address_line2') ??
      readString(value, 'address_line_2') ??
      readString(value, 'shipping_address_line_2'),
    city:
      readString(value, 'city') ??
      readString(value, 'shippingCity') ??
      readString(value, 'shipping_city'),
    country:
      readString(value, 'country') ??
      readString(value, 'shippingCountry') ??
      readString(value, 'shipping_country'),
    postalCode:
      readString(value, 'postalCode') ??
      readString(value, 'shippingPostalCode') ??
      readString(value, 'shipping_postal_code') ??
      readString(value, 'postal_code') ??
      readString(value, 'shipping_postal_code'),
  }
}

function isOrderSummary(value: OrderSummary | null): value is OrderSummary {
  return value !== null
}

function isOrderItemDetails(
  value: OrderItemDetails | null,
): value is OrderItemDetails {
  return value !== null
}

function readArray(
  record: Record<string, unknown>,
  key: string,
): unknown[] | null {
  const value = record[key]

  return Array.isArray(value) ? value : null
}

function readNumber(
  record: Record<string, unknown>,
  key: string,
): number | null {
  const value = record[key]

  return typeof value === 'number' ? value : null
}

function readRecord(
  record: Record<string, unknown>,
  key: string,
): Record<string, unknown> | null {
  const value = record[key]

  return isRecord(value) ? value : null
}

function readString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key]

  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function readStringValue(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key]

  if (typeof value === 'string' && value.trim().length > 0) {
    return value
  }

  return typeof value === 'number' ? String(value) : null
}

function hasCustomerFallback(customer: OrderCustomer): boolean {
  return Boolean(
    customer.email ??
      customer.firstName ??
      customer.lastName ??
      customer.name ??
      customer.phone,
  )
}

function formatCustomerName(
  firstName: string | null,
  lastName: string | null,
): string | null {
  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  return fullName.length > 0 ? fullName : null
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (!isRecord(value)) {
    return false
  }

  if (value.success === true) {
    return 'data' in value
  }

  return value.success === false && typeof value.message === 'string'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
