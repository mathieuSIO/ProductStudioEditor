import type { Cart } from './types'

export const cartStorageKey = 'mon-petit-matos-cart-v1'

export const professionalLogoReviewPrice = 15

export const emptyCart: Cart = {
  items: [],
  options: {
    professionalLogoReview: false,
  },
}
