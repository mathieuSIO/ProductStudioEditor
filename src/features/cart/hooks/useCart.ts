import { useEffect, useMemo, useState } from 'react'

import { calculateCartTotals } from '../pricing/calculateCartTotals'
import { createEmptyCart, loadCart, saveCart } from '../storage/cartStorage'
import { isShopCartItem } from '../types'
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
      items: mergeCartItem(currentCart.items, item),
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
    const emptyCart = createEmptyCart()

    saveCart(emptyCart)
    setCart(emptyCart)
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

function mergeCartItem(items: CartItem[], item: CartItem): CartItem[] {
  if (!isShopCartItem(item)) {
    return [...items, item]
  }

  const existingItem = items.find(
    (currentItem) =>
      isShopCartItem(currentItem) &&
      currentItem.shopProductVariantId === item.shopProductVariantId,
  )

  if (!existingItem) {
    return [...items, item]
  }

  return items.map((currentItem) =>
    isShopCartItem(currentItem) &&
    currentItem.shopProductVariantId === item.shopProductVariantId
      ? {
          ...currentItem,
          quantity: currentItem.quantity + item.quantity,
          updatedAt: new Date().toISOString(),
        }
      : currentItem,
  )
}
