import type {
  ProductCatalogItem,
  ProductCatalogReference,
} from '../types/product.types'
import type {
  Product,
  ProductCategory,
  ProductColor,
  ProductColorId,
  ProductId,
  ProductSize,
} from '../types/Product'

const supportedProductSizes = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  'XXXL',
  'TU',
] satisfies ProductSize[]

const productIdAliases = {
  cap: ['cap', 'casquette'],
  other: ['other', 'autre'],
  polo: ['polo'],
  sweatshirt: ['sweatshirt', 'sweat', 'pull'],
  tshirt: ['tshirt', 't-shirt', 'tee-shirt', 'tee shirt'],
} satisfies Record<ProductId, string[]>

const colorIdAliases = {
  black: ['black', 'noir'],
  navy: ['navy', 'marine', 'bleu marine'],
  white: ['white', 'blanc'],
} satisfies Record<ProductColorId, string[]>

export function adaptProductCatalogToEditorProducts(
  catalogProducts: ProductCatalogItem[],
  fallbackProducts: Product[],
): Product[] {
  if (catalogProducts.length === 0) {
    return fallbackProducts
  }

  return fallbackProducts.map((fallbackProduct) => {
    const catalogProduct = findMatchingCatalogProduct(
      catalogProducts,
      fallbackProduct,
    )

    if (!catalogProduct) {
      return fallbackProduct
    }

    const reference = getMainReference(catalogProduct)

    if (!reference) {
      return fallbackProduct
    }

    const sizes = getEditorSizes(reference.sizes)
    const colors = getEditorColors(reference, fallbackProduct.colors)

    if (sizes.length === 0 || colors.length === 0) {
      return fallbackProduct
    }

    return {
      ...fallbackProduct,
      catalogProductId: catalogProduct.id,
      catalogReferenceId: reference.id,
      category: getEditorCategory(catalogProduct.category, fallbackProduct.category),
      colors,
      name: catalogProduct.name,
      sizes,
      textileUnitPrice: reference.basePriceCents / 100,
    }
  })
}

function findMatchingCatalogProduct(
  catalogProducts: ProductCatalogItem[],
  fallbackProduct: Product,
) {
  const aliases = productIdAliases[fallbackProduct.id]

  const matchingProducts = catalogProducts.filter((catalogProduct) => {
    const candidates = [
      catalogProduct.slug,
      catalogProduct.type,
      catalogProduct.name,
    ].map(normalizeSearchValue)

    return aliases.some((alias) =>
      candidates.some((candidate) => candidate === normalizeSearchValue(alias)),
    )
  })

  return (
    matchingProducts.find(hasReferenceWithEditorData) ??
    matchingProducts[0] ??
    null
  )
}

function getMainReference(
  catalogProduct: ProductCatalogItem,
): ProductCatalogReference | null {
  return (
    catalogProduct.references.find(
      (reference) => reference.sizes.length > 0 && reference.colors.length > 0,
    ) ??
    catalogProduct.references[0] ??
    null
  )
}

function hasReferenceWithEditorData(catalogProduct: ProductCatalogItem) {
  return catalogProduct.references.some(
    (reference) =>
      getEditorSizes(reference.sizes).length > 0 &&
      reference.colors.some((color) => getSupportedColorId(color.name, color.code)),
  )
}

function getEditorSizes(sizes: string[]): ProductSize[] {
  return sizes.filter(isSupportedProductSize)
}

function getEditorColors(
  reference: ProductCatalogReference,
  fallbackColors: ProductColor[],
): ProductColor[] {
  return reference.colors.reduce<ProductColor[]>((colors, catalogColor) => {
    const colorId = getSupportedColorId(catalogColor.name, catalogColor.code)

    if (!colorId) {
      return colors
    }

    const fallbackColor = fallbackColors.find((color) => color.id === colorId)

    if (!fallbackColor) {
      return colors
    }

    colors.push({
      ...fallbackColor,
      availability: 'real',
      label: catalogColor.name,
      swatchHex: catalogColor.swatchHex ?? catalogColor.code ?? fallbackColor.swatchHex,
    })

    return colors
  }, [])
}

function getSupportedColorId(
  name: string,
  code: string | null,
): ProductColorId | null {
  const normalizedValues = [name, code ?? ''].map(normalizeSearchValue)

  return (
    supportedColorIds.find((colorId) =>
      colorIdAliases[colorId].some((alias) =>
        normalizedValues.includes(normalizeSearchValue(alias)),
      ),
    ) ?? null
  )
}

function getEditorCategory(
  category: string | null,
  fallbackCategory: ProductCategory,
): ProductCategory {
  if (category === 'headwear' || category === 'other' || category === 'top') {
    return category
  }

  return fallbackCategory
}

function isSupportedProductSize(size: string): size is ProductSize {
  return supportedProductSizes.some((supportedSize) => supportedSize === size)
}

function normalizeSearchValue(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

const supportedColorIds = ['black', 'navy', 'white'] satisfies ProductColorId[]
