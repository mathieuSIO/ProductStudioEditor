import { describe, expect, it } from 'vitest'

import type { OrderDetails, OrderItemDetails, OrderSummary } from '../types/account.types'
import {
  compareOrdersByCreatedAtDesc,
  formatCustomerEmail,
  formatCustomerName,
  formatItemTotal,
  formatItemUnitPrice,
  formatOrderDate,
  formatOrderReference,
  formatOrderTotal,
  formatShippingAddress,
} from './orderFormatters'

describe('orderFormatters', () => {
  it('formats references and customer identity from explicit order fields', () => {
    const order: OrderSummary = {
      customerEmail: 'client@mpm.test',
      customerFirstName: 'Ada',
      customerLastName: 'Lovelace',
      id: '42',
      orderNumber: 'MPM-42',
      status: 'paid',
    }

    expect(formatOrderReference(order)).toBe('MPM-42')
    expect(formatCustomerName(order)).toBe('Ada Lovelace')
    expect(formatCustomerEmail(order)).toBe('client@mpm.test')
  })

  it('formats money from cents before fallback amount fields', () => {
    const order: OrderSummary = {
      id: '42',
      status: 'paid',
      totalAmount: 999,
      totalCents: 1234,
      totalPriceCents: 5678,
    }

    expect(formatOrderTotal(order)).toBe('56,78\u00a0€')
  })

  it('formats item totals from unit cents and quantity when no total is provided', () => {
    const item: OrderItemDetails = {
      id: 'item-1',
      productName: 'T-shirt',
      quantity: 3,
      unitPriceCents: 1299,
    }

    expect(formatItemUnitPrice(item)).toBe('12,99\u00a0€')
    expect(formatItemTotal(item)).toBe('38,97\u00a0€')
  })

  it('formats valid dates and returns a fallback for invalid dates', () => {
    expect(formatOrderDate('2026-01-15T10:30:00.000Z')).toBe('15 janvier 2026')
    expect(formatOrderDate('not-a-date')).toBe('Date non renseignée')
  })

  it('formats shipping address from available address lines', () => {
    const order: OrderDetails = {
      id: '42',
      items: [],
      shippingAddress: {
        addressLine1: '12 rue des Tests',
        city: 'Paris',
        country: 'France',
        postalCode: '75001',
      },
      status: 'paid',
    }

    expect(formatShippingAddress(order)).toBe('12 rue des Tests, 75001 Paris, France')
  })

  it('sorts newest orders before older or missing dates', () => {
    const orders: OrderSummary[] = [
      { createdAt: null, id: 'missing', status: 'paid' },
      { createdAt: '2026-01-01T00:00:00.000Z', id: 'old', status: 'paid' },
      { createdAt: '2026-02-01T00:00:00.000Z', id: 'new', status: 'paid' },
    ]

    const sortedOrders = [...orders].sort(compareOrdersByCreatedAtDesc)

    expect(sortedOrders.map((order) => order.id)).toEqual(['new', 'old', 'missing'])
  })
})
