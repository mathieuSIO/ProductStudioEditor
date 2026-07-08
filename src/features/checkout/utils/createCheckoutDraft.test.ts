import { describe, expect, it } from 'vitest'

import { createCart, createShopCartItem, createStudioCartItem } from '../../../test/factories/cart'
import { createCheckoutDraft, createOrderPayloadFromCheckoutDraft } from './createCheckoutDraft'

const customerInfo = {
  adresse: '  12 rue des Tests  ',
  codePostal: '75001',
  comment: '',
  company: '',
  email: ' client@mpm.test ',
  firstName: ' Ada ',
  lastName: ' Lovelace ',
  pays: '',
  phone: ' 0600000000 ',
  ville: ' Paris ',
}

describe('createCheckoutDraft', () => {
  it('copies the cart and calculates totals for the checkout draft', () => {
    const cart = createCart({
      items: [createShopCartItem({ quantity: 2, unitPriceCents: 1500 })],
    })

    const draft = createCheckoutDraft(cart, customerInfo, 'standard')

    expect(draft.cart).toBe(cart)
    expect(draft.productionOption).toBe('standard')
    expect(draft.totals.subtotal).toBe(30)
  })
})

describe('createOrderPayloadFromCheckoutDraft', () => {
  it('maps shop and studio cart items into the order payload', () => {
    const cart = createCart({
      items: [
        createShopCartItem({
          name: 'Casquette boutique',
          quantity: 3,
          shopProductId: 11,
          shopProductVariantId: 12,
          unitPriceCents: 1800,
        }),
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
      options: {
        professionalLogoReview: true,
      },
    })
    const draft = createCheckoutDraft(cart, customerInfo, 'rapide')

    const payload = createOrderPayloadFromCheckoutDraft(draft)

    expect(payload.order).toEqual({
      customerEmail: 'client@mpm.test',
      customerFirstName: 'Ada',
      customerLastName: 'Lovelace',
      customerPhone: '0600000000',
      professionalLogoReviewEnabled: true,
      productionOption: 'rapide',
      shippingAddressLine1: '12 rue des Tests',
      shippingAddressLine2: null,
      shippingPostalCode: '75001',
      shippingCity: 'Paris',
      shippingCountry: 'France',
    })
    expect(payload.items).toEqual([
      {
        customization: null,
        finalPreviewUrl: null,
        itemType: 'shop',
        productName: 'Casquette boutique',
        quantity: 3,
        shopProductId: 11,
        shopProductVariantId: 12,
        unitPriceCents: 1800,
      },
      {
        customization: {
          design: cart.items[1]?.kind === 'studio' ? cart.items[1].design : null,
          pricing: cart.items[1]?.kind === 'studio' ? cart.items[1].pricing : null,
          product: {
            catalogProductId: 100,
            catalogReferenceId: 200,
            color: {
              id: 'white',
              label: 'Blanc',
              swatchHex: '#ffffff',
            },
            id: 'tshirt',
            name: 'T-shirt studio',
            quantities: { M: 2 },
            textileUnitPrice: 15,
          },
        },
        finalPreviewUrl: 'https://cdn.mpm.test/final.png',
        itemType: 'studio',
        productId: 100,
        productName: 'T-shirt studio',
        quantity: 2,
        unitPriceCents: 2250,
      },
    ])
  })

  it('rejects studio items with temporary logo previews before order creation', () => {
    const cart = createCart({
      items: [
        createStudioCartItem({
          design: {
            customPlacement: '',
            views: [
              {
                logos: [
                  {
                    id: 'logo-1',
                    mimeType: 'image/png',
                    name: 'logo.png',
                    originalFileSize: 100,
                    position: { x: 0, y: 0 },
                    previewPersistence: 'temporary-object-url',
                    previewUrl: 'blob:logo',
                    printFormat: 'A4',
                    size: { height: 10, width: 10 },
                    source: 'uploaded-file',
                  },
                ],
                viewId: 'front',
              },
            ],
          },
        }),
      ],
    })
    const draft = createCheckoutDraft(cart, customerInfo, 'standard')

    expect(() => createOrderPayloadFromCheckoutDraft(draft)).toThrow(
      "un logo du panier n'a pas ete correctement envoye",
    )
  })
})
