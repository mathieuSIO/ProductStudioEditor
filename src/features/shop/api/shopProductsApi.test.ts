import { describe, expect, it } from 'vitest'

import { apiBaseUrl } from '../../../test/fixtures/api'
import { mockFetchJson, mockFetchJsonSequence } from '../../../test/utils/http'
import {
  fetchShopProductBySlug,
  fetchShopProducts,
  resolveShopProductImageUrl,
} from './shopProductsApi'

describe('resolveShopProductImageUrl', () => {
  it('returns null for missing image URLs', () => {
    expect(resolveShopProductImageUrl(null)).toBeNull()
  })

  it('keeps absolute URLs unchanged', () => {
    expect(resolveShopProductImageUrl('https://cdn.mpm.test/product.png')).toBe(
      'https://cdn.mpm.test/product.png',
    )
  })

  it('prefixes upload URLs with the API base URL', () => {
    expect(resolveShopProductImageUrl('/uploads/shop/product.png')).toBe(
      `${apiBaseUrl}/uploads/shop/product.png`,
    )
  })
})

describe('shopProductsApi', () => {
  it('normalizes active shop products, variants and gallery from snake_case responses', async () => {
    mockFetchJsonSequence([
      {
        data: [
          {
            created_at: '2026-01-01',
            description: 'Produit actif',
            id: 1,
            image_storage_key: 'products/main.png',
            image_url: '/uploads/products/main.png',
            is_active: true,
            name: 'T-shirt actif',
            price_cents: 2500,
            slug: 't-shirt-actif',
            updated_at: '2026-01-02',
          },
          {
            created_at: '2026-01-01',
            description: null,
            id: 2,
            image_storage_key: null,
            image_url: null,
            is_active: false,
            name: 'Produit inactif',
            price_cents: 1000,
            slug: 'produit-inactif',
            updated_at: '2026-01-02',
          },
        ],
        success: true,
      },
      {
        data: {
          images: [
            {
              alt_text: 'Dos',
              display_order: 2,
              id: 12,
              image_storage_key: 'gallery/back.png',
              image_url: '/uploads/gallery/back.png',
            },
            {
              alt_text: 'Devant',
              display_order: 1,
              id: 11,
              image_storage_key: 'gallery/front.png',
              image_url: '/uploads/gallery/front.png',
            },
          ],
          product: {
            created_at: '2026-01-01',
            description: 'Produit actif',
            id: 1,
            image_storage_key: 'products/main.png',
            image_url: '/uploads/products/main.png',
            is_active: true,
            name: 'T-shirt actif',
            price_cents: 2500,
            slug: 't-shirt-actif',
            updated_at: '2026-01-02',
          },
          variants: [
            {
              color_hex: '#ffffff',
              color_name: 'Blanc',
              id: 21,
              image_storage_key: null,
              image_url: null,
              is_active: true,
              price_cents: null,
              size_label: 'M',
              stock_quantity: 8,
            },
          ],
        },
        success: true,
      },
    ])

    const products = await fetchShopProducts()

    expect(products).toHaveLength(1)
    expect(products[0]).toMatchObject({
      id: 1,
      imageStorageKey: 'products/main.png',
      imageUrl: '/uploads/products/main.png',
      isActive: true,
      priceCents: 2500,
      variants: [
        {
          colorHex: '#ffffff',
          colorName: 'Blanc',
          id: 21,
          imageStorageKey: null,
          imageUrl: null,
          isActive: true,
          priceCents: null,
          sizeLabel: 'M',
          stockQuantity: 8,
        },
      ],
    })
    expect(products[0]?.images.map((image) => image.id)).toEqual([11, 12])
  })

  it('normalizes camelCase product details by slug', async () => {
    const fetchMock = mockFetchJson({
      data: {
        createdAt: '2026-01-01',
        description: null,
        id: 1,
        imageStorageKey: null,
        imageUrl: null,
        isActive: true,
        name: 'T-shirt',
        priceCents: 2500,
        slug: 't-shirt',
        updatedAt: '2026-01-02',
        variants: [],
      },
      success: true,
    })

    const product = await fetchShopProductBySlug('t shirt')

    expect(fetchMock).toHaveBeenCalledWith(`${apiBaseUrl}/api/shop/products/t%20shirt`, {
      method: 'GET',
      signal: undefined,
    })
    expect(product.slug).toBe('t-shirt')
  })
})
