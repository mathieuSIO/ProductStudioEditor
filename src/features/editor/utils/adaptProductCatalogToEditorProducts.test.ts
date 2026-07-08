import { describe, expect, it } from 'vitest'

import type { Product } from '../types/Product'
import type { ProductCatalogItem } from '../types/product.types'
import { adaptProductCatalogToEditorProducts } from './adaptProductCatalogToEditorProducts'

const fallbackProduct: Product = {
  category: 'top',
  colors: [
    {
      availability: 'fallback',
      id: 'white',
      label: 'Blanc fallback',
      swatchHex: '#ffffff',
      views: {},
    },
    {
      availability: 'fallback',
      id: 'black',
      label: 'Noir fallback',
      swatchHex: '#000000',
      views: {},
    },
  ],
  id: 'tshirt',
  name: 'T-shirt fallback',
  sizes: ['S', 'M'],
}

describe('adaptProductCatalogToEditorProducts', () => {
  it('returns fallback products when the catalog is empty', () => {
    const products = adaptProductCatalogToEditorProducts([], [fallbackProduct])

    expect(products).toEqual([fallbackProduct])
  })

  it('maps compatible catalog references to editor products', () => {
    const catalogProducts: ProductCatalogItem[] = [
      {
        category: 'top',
        id: 100,
        name: 'T-shirt premium',
        references: [
          {
            basePriceCents: 1850,
            colors: [
              {
                code: '#ffffff',
                id: 1,
                name: 'Blanc',
                swatchHex: '#fafafa',
              },
              {
                code: '#ff0000',
                id: 2,
                name: 'Rouge',
                swatchHex: '#ff0000',
              },
            ],
            description: null,
            fit: null,
            grammageGsm: null,
            id: 200,
            material: null,
            referenceName: 'T-shirt premium',
            sizes: ['XS', 'M', '4XL'],
            supplierName: null,
            supplierReference: null,
          },
        ],
        slug: 't-shirt',
        type: 'tshirt',
      },
    ]

    const products = adaptProductCatalogToEditorProducts(catalogProducts, [
      fallbackProduct,
    ])

    expect(products[0]).toMatchObject({
      catalogProductId: 100,
      catalogReferenceId: 200,
      category: 'top',
      name: 'T-shirt premium',
      sizes: ['XS', 'M'],
      textileUnitPrice: 18.5,
    })
    expect(products[0]?.colors).toEqual([
      {
        availability: 'real',
        id: 'white',
        label: 'Blanc',
        swatchHex: '#fafafa',
        views: {},
      },
    ])
  })

  it('keeps fallback data when catalog reference has no supported editor color', () => {
    const catalogProducts: ProductCatalogItem[] = [
      {
        category: 'top',
        id: 100,
        name: 'T-shirt premium',
        references: [
          {
            basePriceCents: 1850,
            colors: [
              {
                code: '#ff0000',
                id: 1,
                name: 'Rouge',
                swatchHex: '#ff0000',
              },
            ],
            description: null,
            fit: null,
            grammageGsm: null,
            id: 200,
            material: null,
            referenceName: 'T-shirt premium',
            sizes: ['M'],
            supplierName: null,
            supplierReference: null,
          },
        ],
        slug: 't-shirt-premium',
        type: 'textile',
      },
    ]

    const products = adaptProductCatalogToEditorProducts(catalogProducts, [
      fallbackProduct,
    ])

    expect(products[0]).toBe(fallbackProduct)
  })
})
