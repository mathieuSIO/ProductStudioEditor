import type { PrintableArea } from './PrintableArea'

export type ProductCategory = 'headwear' | 'other' | 'top'

export type ProductId = 'cap' | 'other' | 'polo' | 'sweatshirt' | 'tshirt'

export type ProductMockup = 'cap' | 'generic' | 'polo' | 'sweatshirt' | 'tshirt'

export type ProductViewId = 'back' | 'custom' | 'front'

export type ProductColorId = 'black' | 'navy' | 'white'

export type ProductMockupAsset =
  | {
      alt: string
      kind: 'image'
      src: string
    }
  | {
      alt: string
      kind: 'fallback'
      note: string
    }

export type ProductView = {
  asset: ProductMockupAsset
  mockup: ProductMockup
  printableArea: PrintableArea
}

export type ProductColor = {
  availability: 'fallback' | 'real'
  id: ProductColorId
  label: string
  swatchHex: string
  views: Partial<Record<ProductViewId, ProductView>>
}

export type Product = {
  category: ProductCategory
  colors: ProductColor[]
  id: ProductId
  name: string
}
