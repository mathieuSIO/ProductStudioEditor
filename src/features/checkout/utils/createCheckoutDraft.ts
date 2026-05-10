import { calculateCartTotals, type Cart, type CartItem } from '../../cart'
import type {
  CheckoutDraft,
  CheckoutFormData,
  CreateOrderCustomizationProduct,
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
  validatePersistentLogoPreviews(cart)

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
      const productId = getOrderProductId(cartItem)
      const quantity = cartItem.pricing.totalQuantity
      const totalPriceCents = Math.round(cartItem.pricing.grandTotal * 100)
      const unitPriceCents =
        quantity > 0 ? Math.round(totalPriceCents / quantity) : 0

      return {
        productId,
        productName: cartItem.product.name,
        quantity,
        unitPriceCents,
        customization: {
          product: createCustomizationProduct(cartItem, productId),
          design: cartItem.design,
          pricing: cartItem.pricing,
        },
        finalPreviewUrl: getPersistentFinalPreviewUrl(cartItem.finalPreviewUrl),
      }
    }),
  }
}

function validatePersistentLogoPreviews(cart: Cart): void {
  const hasTemporaryLogoPreview = cart.items.some((item) =>
    item.design.views.some((view) =>
      view.logos.some(
        (logo) =>
          logo.previewPersistence === 'temporary-object-url' ||
          Boolean(logo.previewUrl?.startsWith('blob:')),
      ),
    ),
  )

  if (hasTemporaryLogoPreview) {
    throw new Error(
      "Impossible de creer la commande : un logo du panier n'a pas ete correctement envoye au serveur. Retirez-le puis ajoutez-le a nouveau depuis le studio.",
    )
  }
}

function getOrderProductId(cartItem: CartItem): number {
  if (cartItem.product.catalogProductId === undefined) {
    throw new Error(
      "Impossible de creer la commande : un produit du panier n'est pas correctement relie au catalogue. Veuillez le retirer du panier puis l'ajouter a nouveau depuis le studio.",
    )
  }

  return cartItem.product.catalogProductId
}

function createCustomizationProduct(
  cartItem: CartItem,
  catalogProductId: number,
): CreateOrderCustomizationProduct {
  return {
    catalogProductId,
    ...(cartItem.product.catalogReferenceId !== undefined
      ? { catalogReferenceId: cartItem.product.catalogReferenceId }
      : {}),
    ...(cartItem.product.textileUnitPrice !== undefined
      ? { textileUnitPrice: cartItem.product.textileUnitPrice }
      : {}),
    id: cartItem.product.id,
    name: cartItem.product.name,
    color: cartItem.color,
    quantities: cartItem.quantities,
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
