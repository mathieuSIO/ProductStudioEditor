import { describe, expect, it, vi } from 'vitest'

import { createShopProduct, createShopProductVariant } from '../../../test/factories/shop'
import { fixedIsoDate, mockStableCartIdentity } from '../../../test/mocks/time'
import { createCartItemFromShopProduct } from './createCartItemFromShopProduct'

describe('createCartItemFromShopProduct', () => {
  it('creates a shop cart item from product and selected variant', () => {
    mockStableCartIdentity('shop-cart-id')
    const product = createShopProduct({
      imageUrl: '/uploads/products/main.png',
      priceCents: 2500,
    })
    const variant = createShopProductVariant({
      colorHex: '#111111',
      colorName: 'Noir',
      id: 42,
      priceCents: 2800,
      sizeLabel: 'L',
    })

    const item = createCartItemFromShopProduct({
      product,
      quantity: 2,
      variant,
    })

    expect(item).toEqual({
      colorHex: '#111111',
      colorName: 'Noir',
      createdAt: fixedIsoDate,
      id: 'shop-cart-id',
      imageUrl: '/uploads/products/main.png',
      kind: 'shop',
      name: 'T-shirt MPM',
      quantity: 2,
      shopProductId: 10,
      shopProductVariantId: 42,
      sizeLabel: 'L',
      slug: 't-shirt-mpm',
      unitPriceCents: 2800,
      updatedAt: fixedIsoDate,
    })
  })

  it('falls back to product price when the variant has no dedicated price', () => {
    mockStableCartIdentity()
    const product = createShopProduct({ priceCents: 2500 })
    const variant = createShopProductVariant({ priceCents: null })

    const item = createCartItemFromShopProduct({
      product,
      quantity: 1,
      variant,
    })

    expect(item.unitPriceCents).toBe(2500)
  })

  it('normalizes quantity to a minimum integer of one', () => {
    mockStableCartIdentity()
    const product = createShopProduct()
    const variant = createShopProductVariant()

    const decimalItem = createCartItemFromShopProduct({
      product,
      quantity: 3.9,
      variant,
    })
    const invalidItem = createCartItemFromShopProduct({
      product,
      quantity: 0,
      variant,
    })

    expect(decimalItem.quantity).toBe(3)
    expect(invalidItem.quantity).toBe(1)
  })

  it('uses the timestamp fallback when crypto UUID is unavailable', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(fixedIsoDate))
    vi.stubGlobal('crypto', {})
    vi.spyOn(Math, 'random').mockReturnValue(0.5)

    const item = createCartItemFromShopProduct({
      product: createShopProduct(),
      quantity: 1,
      variant: createShopProductVariant(),
    })

    expect(item.id).toBe('cart-item-1768473000000-i')
  })
})
