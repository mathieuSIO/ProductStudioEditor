import type {
  Cart,
  ShopCartItem,
  StudioCartItem,
} from '../../features/cart'

export function createShopCartItem(
  overrides: Partial<ShopCartItem> = {},
): ShopCartItem {
  return {
    colorHex: '#ffffff',
    colorName: 'Blanc',
    createdAt: '2026-01-01T00:00:00.000Z',
    id: 'shop-cart-item',
    imageUrl: '/uploads/shop/product.png',
    kind: 'shop',
    name: 'T-shirt boutique',
    quantity: 2,
    shopProductId: 10,
    shopProductVariantId: 20,
    sizeLabel: 'M',
    slug: 't-shirt-boutique',
    unitPriceCents: 2500,
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function createStudioCartItem(
  overrides: Partial<StudioCartItem> = {},
): StudioCartItem {
  return {
    color: {
      id: 'white',
      label: 'Blanc',
      swatchHex: '#ffffff',
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    design: {
      customPlacement: '',
      finalPreviewUrls: {
        front: 'https://cdn.mpm.test/front.png',
      },
      views: [
        {
          logos: [],
          viewId: 'front',
        },
      ],
    },
    finalPreviewUrl: 'https://cdn.mpm.test/final.png',
    id: 'studio-cart-item',
    kind: 'studio',
    pricing: {
      grandTotal: 42,
      logoLines: [],
      logosCount: 0,
      printTotal: 12,
      textileTotal: 30,
      textileUnitPrice: 15,
      totalQuantity: 2,
    },
    product: {
      catalogProductId: 100,
      catalogReferenceId: 200,
      category: 'top',
      id: 'tshirt',
      name: 'T-shirt studio',
      textileUnitPrice: 15,
    },
    quantities: {
      M: 2,
    },
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function createCart(overrides: Partial<Cart> = {}): Cart {
  return {
    items: [],
    options: {
      professionalLogoReview: false,
    },
    ...overrides,
  }
}
