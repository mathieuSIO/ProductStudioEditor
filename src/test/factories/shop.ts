import type { ShopProduct, ShopProductVariant } from '../../features/shop'

export function createShopProduct(
  overrides: Partial<ShopProduct> = {},
): ShopProduct {
  return {
    createdAt: '2026-01-01T00:00:00.000Z',
    description: 'T-shirt boutique',
    id: 10,
    imageStorageKey: 'shop/product.png',
    imageUrl: '/uploads/shop/product.png',
    images: [],
    isActive: true,
    name: 'T-shirt MPM',
    priceCents: 2500,
    slug: 't-shirt-mpm',
    updatedAt: '2026-01-02T00:00:00.000Z',
    variants: [],
    ...overrides,
  }
}

export function createShopProductVariant(
  overrides: Partial<ShopProductVariant> = {},
): ShopProductVariant {
  return {
    colorHex: '#ffffff',
    colorName: 'Blanc',
    id: 20,
    imageStorageKey: null,
    imageUrl: null,
    isActive: true,
    priceCents: null,
    sizeLabel: 'M',
    stockQuantity: 12,
    ...overrides,
  }
}
