import type { LogoPosition, LogoSize, PrintFormat, ProductCategory, ProductColorId, ProductId, ProductSize, ProductViewId } from '../editor/types'
import type { EditorPricingResult } from '../editor/pricing'

export type CartItemId = string

export type CartLogoPreviewPersistence = 'temporary-object-url' | 'persistent-url'

export type CartLogoSnapshot = {
  id: string
  mimeType: string
  name: string
  originalFileSize: number
  position: LogoPosition
  previewPersistence: CartLogoPreviewPersistence
  previewUrl: string | null
  printFormat: PrintFormat
  size: LogoSize
  source: 'uploaded-file'
}

export type CartDesignViewSnapshot = {
  logos: CartLogoSnapshot[]
  viewId: ProductViewId
}

export type CartDesignSnapshot = {
  customPlacement: string
  views: CartDesignViewSnapshot[]
}

export type CartProductSnapshot = {
  category: ProductCategory
  id: ProductId
  name: string
}

export type CartColorSnapshot = {
  id: ProductColorId
  label: string
  swatchHex: string
}

export type CartQuantitiesBySize = Partial<Record<ProductSize, number>>

export type CartItemPricingSnapshot = Pick<
  EditorPricingResult,
  | 'grandTotal'
  | 'logoLines'
  | 'logosCount'
  | 'printTotal'
  | 'textileTotal'
  | 'textileUnitPrice'
  | 'totalQuantity'
>

export type CartItem = {
  color: CartColorSnapshot
  createdAt: string
  design: CartDesignSnapshot
  id: CartItemId
  pricing: CartItemPricingSnapshot
  product: CartProductSnapshot
  quantities: CartQuantitiesBySize
  updatedAt: string
}

export type CartOptions = {
  professionalLogoReview: boolean
}

export type Cart = {
  items: CartItem[]
  options: CartOptions
}

export type CartTotals = {
  optionsTotal: number
  subtotal: number
  total: number
}

export type CheckoutDraft = {
  items: CartItem[]
  options: CartOptions
  totals: CartTotals
}
