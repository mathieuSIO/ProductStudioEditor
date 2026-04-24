import { useEffect, useMemo, useState } from 'react'

import { calculateCartTotals } from '../pricing/calculateCartTotals'
import { createEmptyCart, loadCart, saveCart } from '../storage/cartStorage'
import type { Cart, CartItem, CartItemId } from '../types'

export function useCart() {
  const [cart, setCart] = useState<Cart>(() => loadCart())
  const totals = useMemo(() => calculateCartTotals(cart), [cart])

  useEffect(() => {
    saveCart(cart)
  }, [cart])

  function addItem(item: CartItem) {
    setCart((currentCart) => ({
      ...currentCart,
      items: [...currentCart.items, item],
    }))
  }

  function removeItem(itemId: CartItemId) {
    setCart((currentCart) => ({
      ...currentCart,
      items: currentCart.items.filter((item) => item.id !== itemId),
    }))
  }

  function setProfessionalLogoReview(enabled: boolean) {
    setCart((currentCart) => ({
      ...currentCart,
      options: {
        ...currentCart.options,
        professionalLogoReview: enabled,
      },
    }))
  }

  function clearCart() {
    setCart(createEmptyCart())
  }

  return {
    addItem,
    cart,
    clearCart,
    itemCount: cart.items.length,
    removeItem,
    setProfessionalLogoReview,
    totals,
  }
}
