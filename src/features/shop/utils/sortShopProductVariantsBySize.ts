import type { ShopProductVariant } from '../types/shop.types'

const SIZE_ORDER = [
  '3/4',
  '5/6',
  '7/8',
  '9/11',
  '12/14',
  'XXS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  'XXXL',
  '4XL',
  '5XL',
  '6XL',
]

const SIZE_ORDER_INDEX = new Map(
  SIZE_ORDER.map((sizeLabel, index) => [sizeLabel, index]),
)

const SIZE_ALIASES: Record<string, string> = {
  '3/4ANS': '3/4',
  '3/4ANS.': '3/4',
  '5/6ANS': '5/6',
  '5/6ANS.': '5/6',
  '7/8ANS': '7/8',
  '7/8ANS.': '7/8',
  '9/11ANS': '9/11',
  '9/11ANS.': '9/11',
  '12/14ANS': '12/14',
  '12/14ANS.': '12/14',
  XXXXL: '4XL',
  XXXXXL: '5XL',
  XXXXXXL: '6XL',
}

export function sortShopProductVariantsBySize(
  variants: ShopProductVariant[],
): ShopProductVariant[] {
  return variants
    .map((variant, originalIndex) => ({ originalIndex, variant }))
    .sort((firstVariant, secondVariant) => {
      const firstOrder = getSizeOrder(firstVariant.variant.sizeLabel)
      const secondOrder = getSizeOrder(secondVariant.variant.sizeLabel)

      if (firstOrder !== secondOrder) {
        return firstOrder - secondOrder
      }

      return firstVariant.originalIndex - secondVariant.originalIndex
    })
    .map(({ variant }) => variant)
}

function getSizeOrder(sizeLabel: string): number {
  return SIZE_ORDER_INDEX.get(normalizeSizeLabel(sizeLabel)) ?? SIZE_ORDER.length
}

function normalizeSizeLabel(sizeLabel: string): string {
  const normalizedSizeLabel = sizeLabel
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s-]+/g, '')

  return SIZE_ALIASES[normalizedSizeLabel] ?? normalizedSizeLabel
}
