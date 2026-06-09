export type ShopProductApiRow = {
  created_at: string
  description: string | null
  id: number
  image_storage_key: string | null
  image_url: string | null
  is_active: boolean
  name: string
  price_cents: number
  slug: string
  updated_at: string
  images?: ShopProductGalleryImageApiRow[]
  variants?: ShopProductVariantApiRow[]
}

export type ShopProductGalleryImageApiRow = {
  altText: string | null
  displayOrder: number
  id: number
  imageStorageKey: string | null
  imageUrl: string
}

export type ShopProductVariantApiRow = {
  colorHex: string | null
  colorName: string
  id: number
  imageStorageKey: string | null
  imageUrl: string | null
  isActive: boolean
  priceCents: number | null
  sizeLabel: string
  stockQuantity: number
}

export type ShopProduct = {
  createdAt: string
  description: string | null
  id: number
  imageStorageKey: string | null
  imageUrl: string | null
  isActive: boolean
  name: string
  priceCents: number
  slug: string
  updatedAt: string
  images: ShopProductGalleryImage[]
  variants: ShopProductVariant[]
}

export type ShopProductGalleryImage = {
  altText: string | null
  displayOrder: number
  id: number
  imageStorageKey: string | null
  imageUrl: string
}

export type ShopProductVariant = {
  colorHex: string | null
  colorName: string
  id: number
  imageStorageKey: string | null
  imageUrl: string | null
  isActive: boolean
  priceCents: number | null
  sizeLabel: string
  stockQuantity: number
}

export type ShopProductsResponse = {
  data: ShopProductApiRow[]
  success: true
}

export type ShopProductResponse = {
  data: ShopProductApiRow
  success: true
}
