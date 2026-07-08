import { describe, expect, it } from 'vitest'

import { apiBaseUrl } from '../../../test/fixtures/api'
import { mockFetchJson } from '../../../test/utils/http'
import {
  fetchAccountProfile,
  fetchUserOrderDetails,
  fetchUserOrders,
} from './accountApi'

describe('accountApi', () => {
  it('normalizes account profile from snake_case fields', async () => {
    mockFetchJson({
      data: {
        address_line_1: '12 rue des Tests',
        address_line_2: null,
        city: 'Paris',
        country: 'France',
        email: 'client@mpm.test',
        email_verified: true,
        first_name: 'Ada',
        id: 7,
        last_name: 'Lovelace',
        phone: '0600000000',
        postal_code: '75001',
      },
      success: true,
    })

    const profile = await fetchAccountProfile()

    expect(profile).toEqual({
      addressLine1: '12 rue des Tests',
      addressLine2: null,
      city: 'Paris',
      country: 'France',
      email: 'client@mpm.test',
      emailVerified: true,
      firstName: 'Ada',
      id: 7,
      lastName: 'Lovelace',
      phone: '0600000000',
      postalCode: '75001',
    })
  })

  it('normalizes order summaries from snake_case response fields', async () => {
    mockFetchJson({
      data: [
        {
          created_at: '2026-01-01',
          customer_email: 'client@mpm.test',
          customer_first_name: 'Ada',
          customer_last_name: 'Lovelace',
          id: 42,
          order_number: 'MPM-42',
          status: 'paid',
          total_price_cents: 5600,
        },
      ],
      success: true,
    })

    const orders = await fetchUserOrders()

    expect(orders).toEqual([
      {
        createdAt: '2026-01-01',
        customer: {
          email: 'client@mpm.test',
          firstName: 'Ada',
          lastName: 'Lovelace',
          name: undefined,
          phone: undefined,
        },
        customerEmail: 'client@mpm.test',
        customerFirstName: 'Ada',
        customerLastName: 'Lovelace',
        customerName: 'Ada Lovelace',
        discountCents: null,
        id: '42',
        orderNumber: 'MPM-42',
        promoCode: null,
        status: 'paid',
        totalAmount: null,
        totalCents: 5600,
        totalPriceCents: 5600,
      },
    ])
  })

  it('normalizes detailed orders with shop and studio item fields', async () => {
    const fetchMock = mockFetchJson({
      data: {
        customer_phone: '0600000000',
        id: '42',
        items: [
          {
            item_type: 'shop',
            product_name: 'T-shirt boutique',
            quantity: 2,
            shop_product_id: 10,
            shop_product_variant_id: 20,
            total_price_cents: 5000,
            unit_price_cents: 2500,
            variant_color_name: 'Blanc',
            variant_size_label: 'M',
          },
          {
            customization: {
              design: {
                finalPreviewUrls: {
                  front: 'https://cdn.mpm.test/front.png',
                },
              },
            },
            final_preview_url: 'https://cdn.mpm.test/final.png',
            item_type: 'studio',
            product_id: 100,
            product_name: 'T-shirt studio',
            quantity: 1,
            unit_price_cents: 4500,
          },
        ],
        order_options: {
          professional_logo_review: true,
          professional_logo_review_price_cents: 1500,
        },
        shipping_address: {
          address_line_1: '12 rue des Tests',
          city: 'Paris',
          country: 'France',
          postal_code: '75001',
        },
        shipment: {
          shipping_method: 'relay',
          tracking_number: 'TRACK42',
        },
        status: 'paid',
        total_cents: 9500,
      },
      success: true,
    })

    const order = await fetchUserOrderDetails('42')

    expect(fetchMock).toHaveBeenCalledWith(`${apiBaseUrl}/api/me/orders/42`, {
      headers: {},
    })
    expect(order.items).toHaveLength(2)
    expect(order.items[0]).toMatchObject({
      itemType: 'shop',
      productName: 'T-shirt boutique',
      shopProductId: 10,
      shopProductVariantId: 20,
      variantColorName: 'Blanc',
      variantSizeLabel: 'M',
    })
    expect(order.items[1]).toMatchObject({
      finalPreviewUrl: 'https://cdn.mpm.test/final.png',
      itemType: 'studio',
      productId: 100,
      productName: 'T-shirt studio',
    })
    expect(order.options).toEqual({
      professionalLogoReview: true,
      professionalLogoReviewPriceCents: 1500,
      productionLabel: null,
      productionPercentage: null,
      productionPriceCents: null,
    })
    expect(order.shippingAddress).toEqual({
      addressLine1: '12 rue des Tests',
      addressLine2: null,
      city: 'Paris',
      country: 'France',
      postalCode: '75001',
    })
    expect(order.shipment).toMatchObject({
      shippingMethod: 'relay',
      trackingNumber: 'TRACK42',
    })
  })
})
