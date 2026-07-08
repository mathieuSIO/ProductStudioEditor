import { describe, expect, it } from 'vitest'

import { professionalLogoReviewPrice } from '../constants'
import { calculateCartTotals } from './calculateCartTotals'
import { createCart, createShopCartItem, createStudioCartItem } from '../../../test/factories/cart'

describe('calculateCartTotals', () => {
  it('returns zero totals for an empty cart without options', () => {
    const cart = createCart()

    const totals = calculateCartTotals(cart)

    expect(totals).toEqual({
      optionsTotal: 0,
      subtotal: 0,
      total: 0,
    })
  })

  it('adds shop item totals from unit cents and quantity', () => {
    const cart = createCart({
      items: [
        createShopCartItem({
          quantity: 3,
          unitPriceCents: 1299,
        }),
      ],
    })

    const totals = calculateCartTotals(cart)

    expect(totals).toEqual({
      optionsTotal: 0,
      subtotal: 38.97,
      total: 38.97,
    })
  })

  it('adds studio item grand totals to the subtotal', () => {
    const cart = createCart({
      items: [
        createStudioCartItem({
          pricing: {
            grandTotal: 45,
            logoLines: [],
            logosCount: 1,
            printTotal: 15,
            textileTotal: 30,
            textileUnitPrice: 15,
            totalQuantity: 2,
          },
        }),
      ],
    })

    const totals = calculateCartTotals(cart)

    expect(totals.subtotal).toBe(45)
  })

  it('charges professional logo review only when the cart contains a studio item', () => {
    const shopOnlyCart = createCart({
      items: [createShopCartItem()],
      options: {
        professionalLogoReview: true,
      },
    })
    const studioCart = createCart({
      items: [createStudioCartItem()],
      options: {
        professionalLogoReview: true,
      },
    })

    const shopOnlyTotals = calculateCartTotals(shopOnlyCart)
    const studioTotals = calculateCartTotals(studioCart)

    expect(shopOnlyTotals.optionsTotal).toBe(0)
    expect(studioTotals.optionsTotal).toBe(professionalLogoReviewPrice)
    expect(studioTotals.total).toBe(studioTotals.subtotal + professionalLogoReviewPrice)
  })
})
