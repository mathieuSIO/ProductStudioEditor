import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppShell } from '../../components/layout/AppShell'
import {
  createCartItemFromEditor,
  useCart,
  type CreateCartItemFromEditorInput,
} from '../../features/cart'
import { EditorLayout } from '../../features/editor'
import { CartPage } from '../CartPage'
import { CheckoutPage } from '../CheckoutPage'

type HomePageView = 'cart' | 'checkout' | 'studio'

export function HomePage() {
  const navigate = useNavigate()
  const {
    addItem,
    cart,
    itemCount,
    removeItem,
    setProfessionalLogoReview,
    totals,
  } = useCart()
  const [currentView, setCurrentView] = useState<HomePageView>('studio')

  function handleAddToCart(configuration: CreateCartItemFromEditorInput) {
    addItem(createCartItemFromEditor(configuration))
  }

  function handleContinueToCheckout() {
    if (cart.items.length === 0) {
      return
    }

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
    navigate('/account')
  }

  function handleReturnToStudio() {
    setCurrentView('studio')
  }

  const headerActionLabel =
    currentView === 'cart' ? 'Studio' : `Panier (${itemCount})`
  const headerActionAriaLabel =
    currentView === 'cart'
      ? 'Retourner au studio'
      : `Ouvrir le panier, ${itemCount} configuration${
          itemCount > 1 ? 's' : ''
        }`

  return (
    <AppShell
      title="Mon Petit Matos"
      subtitle="Impression textile personnalisée - Made in France"
      action={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-[1rem] border border-blue-100 bg-white px-4 py-2.5 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            onClick={handleOpenAccount}
          >
            Mes commandes
          </button>
          <button
            type="button"
            aria-label={headerActionAriaLabel}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[1rem] bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_32px_-24px_rgba(15,23,42,0.75)] transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
            onClick={handleHeaderActionClick}
          >
            <span>{headerActionLabel}</span>
            {currentView !== 'cart' ? (
              <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white ring-1 ring-white/20">
                {itemCount}
              </span>
            ) : null}
          </button>
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
      ) : currentView === 'checkout' && cart.items.length > 0 ? (
        <CheckoutPage
          cart={cart}
          onReturnToCart={() => setCurrentView('cart')}
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
