import type { QuantityTier } from './types'

export function getQuantityTier(
  quantity: number,
  tiers: QuantityTier[],
): QuantityTier {
  const matchingTier = tiers.find(
    (tier) =>
      quantity >= tier.minQuantity &&
      (tier.maxQuantity === null || quantity <= tier.maxQuantity),
  )

  if (!matchingTier) {
    throw new Error(`No quantity tier found for quantity ${quantity}.`)
  }

  return matchingTier
}
