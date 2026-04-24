import { useState } from 'react'

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

  const headerActionLabel = currentView === 'cart' ? 'Studio' : 'Panier'

  return (
    <AppShell
      title="Mon Petit Matos"
      subtitle="Structure principale de l'application de personnalisation textile, pensee pour rester lisible, modulaire et evolutive."
      action={
        <button
          type="button"
          aria-label={`Ouvrir le panier, ${itemCount} configuration${itemCount > 1 ? 's' : ''}`}
          className="inline-flex items-center justify-center gap-2 rounded-[0.95rem] border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-800 shadow-[0_12px_30px_-24px_rgba(28,25,23,0.35)] transition hover:border-stone-400 hover:bg-stone-50"
          onClick={handleHeaderActionClick}
        >
          <span>{headerActionLabel}</span>
          <span className="rounded-full bg-stone-900 px-2 py-0.5 text-xs font-semibold text-white">
            {itemCount} config.
          </span>
        </button>
      }
    >
      {currentView === 'cart' ? (
        <CartPage
          cart={cart}
          onContinueToCheckout={handleContinueToCheckout}
          onProfessionalLogoReviewChange={setProfessionalLogoReview}
          onRemoveItem={removeItem}
          onReturnToStudio={() => setCurrentView('studio')}
          totals={totals}
        />
      ) : currentView === 'checkout' && cart.items.length > 0 ? (
        <CheckoutPage
          cart={cart}
          onReturnToCart={() => setCurrentView('cart')}
          totals={totals}
        />
      ) : (
        <EditorLayout onAddToCart={handleAddToCart} />
      )}
    </AppShell>
  )
}
