export type ProductCatalogColor = {
  code: string | null
  id: number
  name: string
  swatchHex: string | null
}

export type ProductCatalogReference = {
  basePriceCents: number
  colors: ProductCatalogColor[]
  description: string | null
  fit: string | null
  grammageGsm: number | null
  id: number
  material: string | null
  referenceName: string
  sizes: string[]
  supplierName: string | null
  supplierReference: string | null
}

export type ProductCatalogItem = {
  category: string | null
  id: number
  name: string
  references: ProductCatalogReference[]
  slug: string
  type: string
}
