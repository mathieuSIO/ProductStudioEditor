import { describe, expect, it } from 'vitest'

import { createShopProductVariant } from '../../../test/factories/shop'
import { sortShopProductVariantsBySize } from './sortShopProductVariantsBySize'

describe('sortShopProductVariantsBySize', () => {
  it('sorts known adult sizes by product size order', () => {
    const variants = [
      createShopProductVariant({ id: 1, sizeLabel: 'XL' }),
      createShopProductVariant({ id: 2, sizeLabel: 'S' }),
      createShopProductVariant({ id: 3, sizeLabel: 'M' }),
    ]

    const sortedVariants = sortShopProductVariantsBySize(variants)

    expect(sortedVariants.map((variant) => variant.sizeLabel)).toEqual([
      'S',
      'M',
      'XL',
    ])
  })

  it('normalizes children size aliases and accents before sorting', () => {
    const variants = [
      createShopProductVariant({ id: 1, sizeLabel: 'M' }),
      createShopProductVariant({ id: 2, sizeLabel: '5/6 ans.' }),
      createShopProductVariant({ id: 3, sizeLabel: '3/4 ans' }),
    ]

    const sortedVariants = sortShopProductVariantsBySize(variants)

    expect(sortedVariants.map((variant) => variant.id)).toEqual([3, 2, 1])
  })

  it('keeps unknown sizes stable after known sizes', () => {
    const variants = [
      createShopProductVariant({ id: 1, sizeLabel: 'Edition speciale' }),
      createShopProductVariant({ id: 2, sizeLabel: 'M' }),
      createShopProductVariant({ id: 3, sizeLabel: 'Coupe longue' }),
    ]

    const sortedVariants = sortShopProductVariantsBySize(variants)

    expect(sortedVariants.map((variant) => variant.id)).toEqual([2, 1, 3])
  })
})
