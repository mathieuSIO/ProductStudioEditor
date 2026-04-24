import type { EditorPricingResult } from '../pricing'
import type { DesignElement } from './DesignElement'
import type { Product, ProductColor, ProductSize, ProductViewId } from './Product'

export type EditorStudioConfiguration = {
  color: ProductColor
  customPlacement: string
  elementsByView: Record<ProductViewId, DesignElement[]>
  pricing: EditorPricingResult
  product: Product
  quantities: Partial<Record<ProductSize, number>>
}
