import type { EditorPricingResult } from '../pricing'
import type { DesignElement } from './DesignElement'
import type { Product, ProductColor, ProductSize, ProductViewId } from './Product'

export type EditorStudioConfiguration = {
  color: ProductColor
  customPlacement: string
  elementsByView: Record<ProductViewId, DesignElement[]>
  finalPreviewUrl: string
  finalPreviewUrls: Partial<Record<ProductViewId, string>>
  pricing: EditorPricingResult
  product: Product
  quantities: Partial<Record<ProductSize, number>>
}
