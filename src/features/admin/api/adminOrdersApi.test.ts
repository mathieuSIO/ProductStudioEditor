import { describe, expect, it } from 'vitest'

import { apiBaseUrl } from '../../../test/fixtures/api'
import { fetchUserOrderDetails } from '../../account/api/accountApi'
import { mockFetchJson, mockFetchJsonSequence } from '../../../test/utils/http'
import {
  fetchAdminOrderDetails,
  fetchAdminOrders,
  updateAdminOrderStatus,
} from './adminOrdersApi'

describe('adminOrdersApi', () => {
  it('normalizes admin order summaries with nested order items', async () => {
    mockFetchJson({
      data: [
        {
          customer: {
            email: 'client@mpm.test',
            first_name: 'Ada',
            last_name: 'Lovelace',
          },
          id: 42,
          items: [
            {
              id: 1,
              item_type: 'shop',
              product_name: 'T-shirt boutique',
              quantity: 2,
              shop_product_id: 10,
              shop_product_variant_id: 20,
            },
          ],
          order_number: 'MPM-42',
          status: 'paid',
          total_cents: 5000,
        },
      ],
      success: true,
    })

    const orders = await fetchAdminOrders()

    expect(orders[0]).toMatchObject({
      customer: {
        email: 'client@mpm.test',
        firstName: 'Ada',
        lastName: 'Lovelace',
      },
      id: '42',
      items: [
        {
          id: '1',
          itemType: 'shop',
          productName: 'T-shirt boutique',
          quantity: 2,
          shopProductId: 10,
          shopProductVariantId: 20,
        },
      ],
      orderNumber: 'MPM-42',
      status: 'paid',
      totalCents: 5000,
    })
  })

  it('normalizes admin order details with gallery preview URLs and shipment fields', async () => {
    mockFetchJson({
      data: {
        id: '42',
        items: [
          {
            final_preview_urls: {
              back: 'https://cdn.mpm.test/back.png',
              front: 'https://cdn.mpm.test/front.png',
            },
            item_type: 'studio',
            product_name: 'T-shirt studio',
            quantity: 1,
          },
        ],
        shipping_address: {
          address_line_1: '12 rue des Tests',
          city: 'Paris',
          country: 'France',
          postal_code: '75001',
        },
        shipping_method: 'home',
        shipping_price_cents: 699,
        status: 'processing',
        total_cents: 4500,
        total_weight_grams: 400,
      },
      success: true,
    })

    const order = await fetchAdminOrderDetails('42')

    expect(order.items[0]).toMatchObject({
      finalPreviewUrls: {
        back: 'https://cdn.mpm.test/back.png',
        custom: undefined,
        front: 'https://cdn.mpm.test/front.png',
      },
      itemType: 'studio',
      productName: 'T-shirt studio',
    })
    expect(order.shipment).toMatchObject({
      shippingMethod: 'home',
      shippingPriceCents: 699,
      totalWeightGrams: 400,
    })
  })

  it('sends status updates to the admin endpoint and normalizes the returned order', async () => {
    const fetchMock = mockFetchJson({
      data: {
        id: '42',
        status: 'shipped',
      },
      success: true,
    })

    const order = await updateAdminOrderStatus('42', 'shipped')

    expect(fetchMock).toHaveBeenCalledWith(`${apiBaseUrl}/api/admin/orders/42/status`, {
      body: JSON.stringify({ status: 'shipped' }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
    })
    expect(order.status).toBe('shipped')
  })

  it('normalizes a pending Mondial Relay order with null relay fields', async () => {
    mockAdminOrderDetails({
      relay_point_address_line1: null,
      relay_point_address_line2: null,
      relay_point_city: null,
      relay_point_country: null,
      relay_point_id: null,
      relay_point_name: null,
      relay_point_postal_code: null,
      relay_point_selected_at: null,
      relay_selection_status: 'pending',
      shipping_method: 'mondial_relay',
    })

    const order = await fetchAdminOrderDetails('42')

    expect(order.relayPoint).toEqual({
      addressLine1: null,
      addressLine2: null,
      city: null,
      country: null,
      id: null,
      name: null,
      postalCode: null,
      selectedAt: null,
      selectionStatus: 'pending',
    })
  })

  it('normalizes complete selected relay fields to camelCase', async () => {
    mockAdminOrderDetails(createSelectedRelayFixture())

    const order = await fetchAdminOrderDetails('42')

    expect(order.shippingMethod).toBe('mondial_relay')
    expect(order.relayPoint).toEqual({
      addressLine1: '171 route de Launaguet',
      addressLine2: 'Locker extérieur',
      city: 'Toulouse',
      country: 'FR',
      id: '033594',
      name: 'Locker Le Fournil',
      postalCode: '31200',
      selectedAt: '2026-08-11T12:32:00.000Z',
      selectionStatus: 'selected',
    })
  })

  it('preserves a null relay address line 2', async () => {
    mockAdminOrderDetails({
      ...createSelectedRelayFixture(),
      relay_point_address_line2: null,
    })

    const order = await fetchAdminOrderDetails('42')

    expect(order.relayPoint?.addressLine2).toBeNull()
  })

  it('does not expose relay details for another shipping method', async () => {
    mockAdminOrderDetails({
      ...createSelectedRelayFixture(),
      shipping_method: 'home',
    })

    const order = await fetchAdminOrderDetails('42')

    expect(order.shippingMethod).toBe('home')
    expect(order.relayPoint).toBeNull()
  })

  it('does not expose relay details without a selection status', async () => {
    mockAdminOrderDetails({
      ...createSelectedRelayFixture(),
      relay_selection_status: null,
    })

    const order = await fetchAdminOrderDetails('42')

    expect(order.relayPoint).toBeNull()
  })

  it('preserves a null selected-at value', async () => {
    mockAdminOrderDetails({
      ...createSelectedRelayFixture(),
      relay_point_selected_at: null,
    })

    const order = await fetchAdminOrderDetails('42')

    expect(order.relayPoint?.selectedAt).toBeNull()
  })

  it('produces compatible account and admin relay point details', async () => {
    const response = {
      data: {
        id: 42,
        items: [],
        status: 'paid',
        ...createSelectedRelayFixture(),
      },
      success: true,
    }
    mockFetchJsonSequence([response, response])

    const accountOrder = await fetchUserOrderDetails('42')
    const adminOrder = await fetchAdminOrderDetails('42')

    expect(adminOrder.relayPoint).toEqual(accountOrder.relayPoint)
  })
})

function mockAdminOrderDetails(fields: Record<string, unknown>) {
  return mockFetchJson({
    data: {
      id: 42,
      items: [],
      status: 'paid',
      ...fields,
    },
    success: true,
  })
}

function createSelectedRelayFixture(): Record<string, unknown> {
  return {
    relay_point_address_line1: '171 route de Launaguet',
    relay_point_address_line2: 'Locker extérieur',
    relay_point_city: 'Toulouse',
    relay_point_country: 'FR',
    relay_point_id: '033594',
    relay_point_name: 'Locker Le Fournil',
    relay_point_postal_code: '31200',
    relay_point_selected_at: '2026-08-11T12:32:00.000Z',
    relay_selection_status: 'selected',
    shipping_method: 'mondial_relay',
  }
}
