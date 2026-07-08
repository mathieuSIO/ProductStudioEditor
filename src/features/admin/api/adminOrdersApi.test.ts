import { describe, expect, it } from 'vitest'

import { apiBaseUrl } from '../../../test/fixtures/api'
import { mockFetchJson } from '../../../test/utils/http'
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
})
