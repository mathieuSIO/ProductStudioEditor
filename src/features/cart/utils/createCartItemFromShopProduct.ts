import type { ShopProduct, ShopProductVariant } from '../../shop'
import type { ShopCartItem } from '../types'

export type CreateCartItemFromShopProductInput = {
  product: ShopProduct
  quantity: number
  variant: ShopProductVariant
}

export function createCartItemFromShopProduct({
  product,
  quantity,
  variant,
}: CreateCartItemFromShopProductInput): ShopCartItem {
  const now = new Date().toISOString()

  return {
    colorHex: variant.colorHex,
    colorName: variant.colorName,
    createdAt: now,
    id: createCartItemId(),
    imageUrl: product.imageUrl,
    kind: 'shop',
    name: product.name,
    quantity: Math.max(1, Math.floor(quantity)),
    shopProductId: product.id,
    shopProductVariantId: variant.id,
    sizeLabel: variant.sizeLabel,
    slug: product.slug,
    unitPriceCents: variant.priceCents ?? product.priceCents,
    updatedAt: now,
  }
}

function createCartItemId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  return `cart-item-${Date.now()}-${Math.random().toString(36).slice(2)}`
}
