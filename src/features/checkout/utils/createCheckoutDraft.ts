import { calculateCartTotals, type Cart } from '../../cart'
import type {
  CheckoutDraft,
  CheckoutFormData,
  CreateOrderPayload,
} from '../types'

export function createCheckoutDraft(
  cart: Cart,
  customerInfo: CheckoutFormData,
): CheckoutDraft {
  const totals = calculateCartTotals(cart)

  return {
    cart,
    customerInfo,
    totals,
  }
}

export function createOrderPayloadFromCheckoutDraft(
  checkoutDraft: CheckoutDraft,
): CreateOrderPayload {
  const { cart, customerInfo } = checkoutDraft

  return {
    order: {
      customerEmail: customerInfo.email.trim(),
      customerFirstName: formatNullableValue(customerInfo.firstName),
      customerLastName: formatNullableValue(customerInfo.lastName),
      customerPhone: formatNullableValue(customerInfo.phone),
      shippingAddressLine1: formatNullableValue(customerInfo.adresse),
      shippingAddressLine2: null,
      shippingPostalCode: formatNullableValue(customerInfo.codePostal),
      shippingCity: formatNullableValue(customerInfo.ville),
      shippingCountry: formatNullableValue(customerInfo.pays) ?? 'France',
    },
    items: cart.items.map((cartItem) => {
      const quantity = cartItem.pricing.totalQuantity
      const totalPriceCents = Math.round(cartItem.pricing.grandTotal * 100)
      const unitPriceCents =
        quantity > 0 ? Math.round(totalPriceCents / quantity) : 0

      return {
        // TODO: remplacer par l'id produit backend quand il sera expose cote front.
        productId: 1,
        productName: cartItem.product.name,
        quantity,
        unitPriceCents,
        customization: {
          product: {
            id: cartItem.product.id,
            name: cartItem.product.name,
            color: cartItem.color,
            quantities: cartItem.quantities,
          },
          design: cartItem.design,
          pricing: cartItem.pricing,
        },
        finalPreviewUrl: getPersistentFinalPreviewUrl(cartItem.finalPreviewUrl),
      }
    }),
  }
}

function getPersistentFinalPreviewUrl(value: string | null | undefined) {
  if (!value || value.startsWith('blob:')) {
    return null
  }

  return value
}

function formatNullableValue(value: string): string | null {
  const formattedValue = value.trim()

  return formattedValue.length > 0 ? formattedValue : null
}
