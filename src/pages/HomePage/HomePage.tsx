import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { AppShell } from '../../components/layout/AppShell'
import {
  createCartItemFromEditor,
  HeaderCartButton,
  useCart,
  type CreateCartItemFromEditorInput,
} from '../../features/cart'
import { EditorLayout } from '../../features/editor'
import { trackMetaEvent } from '../../lib/metaPixel'
import { CartPage } from '../CartPage'
import { CheckoutPage } from '../CheckoutPage'

type HomePageView = 'cart' | 'checkout' | 'studio'

export function HomePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const {
    addItem,
    cart,
    itemCount,
    removeItem,
    setProfessionalLogoReview,
    totals,
  } = useCart()
  const [currentView, setCurrentView] = useState<HomePageView>(() =>
    searchParams.get('view') === 'cart' ? 'cart' : 'studio',
  )

  function handleAddToCart(configuration: CreateCartItemFromEditorInput) {
    const cartItem = createCartItemFromEditor(configuration)

    addItem(cartItem)
    trackMetaEvent('AddToCart', {
      content_ids: [configuration.product.id],
      content_name: configuration.product.name,
      content_type: 'product',
      currency: 'EUR',
      value: configuration.pricing.grandTotal,
    })
  }

  function handleContinueToCheckout() {
    if (cart.items.length === 0) {
      return
    }

    trackMetaEvent('InitiateCheckout', {
      currency: 'EUR',
      num_items: cart.items.length,
      value: totals.total,
    })
    setCurrentView('checkout')
  }

  function handleHeaderActionClick() {
    setCurrentView((view) => {
      if (view === 'cart') {
        return 'studio'
      }

      return 'cart'
    })
  }

  function handleOpenAccount() {
    navigate('/account/profile')
  }

  function handleReturnToStudio() {
    setCurrentView('studio')
  }

  return (
    <AppShell
      title="Mon Petit Matos"
      subtitle="Impression textile personnalisée - Made in France"
      action={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-[1rem] border border-blue-100 bg-white px-4 py-2.5 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            onClick={() => navigate('/boutique')}
          >
            Boutique
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-[1rem] border border-blue-100 bg-white px-4 py-2.5 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            onClick={handleOpenAccount}
          >
            Mon Compte
          </button>
          <HeaderCartButton
            isCartOpen={currentView === 'cart'}
            itemCount={itemCount}
            onClick={handleHeaderActionClick}
          />
        </div>
      }
      onReturnToStudio={handleReturnToStudio}
    >
      {currentView === 'cart' ? (
        <CartPage
          cart={cart}
          onContinueToCheckout={handleContinueToCheckout}
          onProfessionalLogoReviewChange={setProfessionalLogoReview}
          onRemoveItem={removeItem}
          onReturnToStudio={handleReturnToStudio}
          totals={totals}
        />
      ) : currentView === 'checkout' ? (
        <CheckoutPage
          cart={cart}
          onReturnToCart={() => setCurrentView('cart')}
          onReturnToStudio={handleReturnToStudio}
          totals={totals}
        />
      ) : (
        <EditorLayout
          onAddToCart={handleAddToCart}
          onOpenCart={() => setCurrentView('cart')}
        />
      )}
    </AppShell>
  )
}
