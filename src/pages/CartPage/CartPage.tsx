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
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0">
        <div className="mb-4 flex flex-col gap-3 rounded-[1.25rem] border border-blue-100 bg-white px-4 py-4 shadow-[0_16px_38px_-34px_rgba(15,23,42,0.35)] sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-600">
              Panier
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-blue-950">
              Votre panier
            </h1>
            <p className="mt-1 text-sm leading-5 text-blue-800">
              Vérifiez vos personnalisations avant de passer à la validation.
            </p>
          </div>
          <button
            type="button"
            className="rounded-[0.95rem] border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-950 transition hover:border-red-200 hover:bg-white hover:text-red-600"
            onClick={onReturnToStudio}
          >
            Retour au studio
          </button>
        </div>

        {isCartEmpty ? (
          <div className="rounded-[1.25rem] border border-dashed border-blue-200 bg-white px-4 py-10 text-center shadow-[0_16px_38px_-34px_rgba(15,23,42,0.25)]">
            <p className="text-lg font-semibold text-blue-950">
              Votre panier est vide
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-blue-800">
              Ajoutez une personnalisation depuis le studio pour retrouver ici
              votre produit, vos quantités et votre estimation.
            </p>
          </div>
        ) : (
          <div className="grid gap-3.5">
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
