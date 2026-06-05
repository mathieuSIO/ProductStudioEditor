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
}

export type ShopProductsResponse = {
  data: ShopProductApiRow[]
  success: true
}

export type ShopProductResponse = {
  data: ShopProductApiRow
  success: true
}
