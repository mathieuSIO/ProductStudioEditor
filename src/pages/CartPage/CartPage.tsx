import {
  CartItemCard,
  CartSummaryPanel,
  type Cart,
  type CartItemId,
  type CartTotals,
} from '../../features/cart'

type CartPageProps = {
  cart: Cart
  onContinueToCheckout: () => void
  onProfessionalLogoReviewChange: (enabled: boolean) => void
  onRemoveItem: (itemId: CartItemId) => void
  onReturnToStudio: () => void
  totals: CartTotals
}

export function CartPage({
  cart,
  onContinueToCheckout,
  onProfessionalLogoReviewChange,
  onRemoveItem,
  onReturnToStudio,
  totals,
}: CartPageProps) {
  const isCartEmpty = cart.items.length === 0

  return (
    <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
              Panier
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-stone-950">
              Produits ajoutés
            </h1>
          </div>
          <button
            type="button"
            className="rounded-[0.9rem] border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
            onClick={onReturnToStudio}
          >
            Retour au studio
          </button>
        </div>

        {isCartEmpty ? (
          <div className="rounded-[1rem] border border-dashed border-stone-300 bg-white px-4 py-8 text-center">
            <p className="text-base font-semibold text-stone-900">
              Ton panier est vide
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Ajoute une configuration depuis le studio pour la retrouver ici.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {cart.items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onRemove={onRemoveItem}
              />
            ))}
          </div>
        )}
      </div>

      <CartSummaryPanel
        isCheckoutDisabled={isCartEmpty}
        onContinueToCheckout={onContinueToCheckout}
        onProfessionalLogoReviewChange={onProfessionalLogoReviewChange}
        options={cart.options}
        totals={totals}
      />
    </section>
  )
}
