export {
  fetchShopProductBySlug,
  fetchShopProducts,
  resolveShopProductImageUrl,
} from './api/shopProductsApi'
export { ShopProductCard } from './components/ShopProductCard'
export { ShopProductImage } from './components/ShopProductImage'
export type {
  ShopProduct,
  ShopProductApiRow,
  ShopProductGalleryImage,
  ShopProductGalleryImageApiRow,
  ShopProductResponse,
  ShopProductVariant,
  ShopProductVariantApiRow,
  ShopProductsResponse,
} from './types/shop.types'
