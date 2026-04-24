import { formatEuro } from '../../../../shared/formatters/formatEuro'
import type { Product, ProductColor } from '../../types'

type PriceSummaryPanelProps = {
  addToCartFeedbackMessage: string | null
  canAddToCart: boolean
  grandTotal: number
  onAddToCart?: () => void
  product: Product
  productColor: ProductColor
  totalQuantity: number
}

const reassuranceItems = [
  'Marquage en France',
  'Vérification du logo possible',
  'Accompagnement humain avant production',
]

export function PriceSummaryPanel({
  addToCartFeedbackMessage,
  canAddToCart,
  grandTotal,
  onAddToCart,
  product,
  productColor,
  totalQuantity,
}: PriceSummaryPanelProps) {
  const hasQuantity = totalQuantity > 0
  const unitPrice = hasQuantity ? grandTotal / totalQuantity : 0
  const isAddToCartDisabled = !canAddToCart || !onAddToCart

  return (
    <div className="overflow-hidden rounded-[1.15rem] border border-blue-100 bg-white shadow-[0_18px_42px_-34px_rgba(15,23,42,0.45)]">
      <div className="border-b border-blue-100 bg-blue-950 px-3.5 py-3 text-white">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-100">
          Votre estimation
        </p>
        <p className="mt-1 text-sm leading-5 text-blue-100">
          Prix indicatif mis à jour selon votre produit, votre couleur et vos
          quantités.
        </p>
      </div>

      <div className="grid gap-3 p-3.5">
        <div className="rounded-[0.95rem] border border-blue-100 bg-blue-50 px-3 py-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
                Produit
              </p>
              <p className="mt-1 text-sm font-semibold text-blue-950">
                {product.name}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-blue-100 bg-white px-2 py-1">
              <span
                className="h-3.5 w-3.5 rounded-full border border-stone-300"
                style={{ backgroundColor: productColor.swatchHex }}
              />
              <span className="text-[11px] font-semibold text-blue-900">
                {productColor.label}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 rounded-[1rem] border border-blue-100 bg-white px-3 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
              Total estimé
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-blue-950">
              {formatEuro(grandTotal)}
            </p>
            {hasQuantity ? (
              <p className="mt-1 text-sm font-medium text-blue-700">
                {formatEuro(unitPrice)} / pièce
              </p>
            ) : (
              <p className="mt-1 text-sm text-stone-500">
                Ajoutez une quantité pour afficher le prix unitaire.
              </p>
            )}
          </div>

          <div className="rounded-[0.95rem] border border-red-100 bg-red-50 px-3 py-2 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-700">
              Quantité
            </p>
            <p className="mt-1 text-xl font-semibold text-red-700">
              {totalQuantity}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="w-full rounded-[1rem] bg-red-600 px-4 py-3.5 text-base font-semibold text-white shadow-[0_18px_38px_-28px_rgba(220,38,38,0.75)] transition hover:bg-red-700 disabled:cursor-not-allowed disabled:border disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-400 disabled:shadow-none"
          disabled={isAddToCartDisabled}
          onClick={onAddToCart}
        >
          Ajouter au panier →
        </button>

        {!hasQuantity ? (
          <p className="rounded-[0.9rem] border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            Ajoutez une quantité pour continuer
          </p>
        ) : null}

        {addToCartFeedbackMessage ? (
          <p className="rounded-[0.9rem] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            {addToCartFeedbackMessage}
          </p>
        ) : null}

        <div className="grid gap-2 rounded-[1rem] border border-blue-100 bg-blue-50 px-3 py-3">
          {reassuranceItems.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-red-600">
                ✓
              </span>
              <span className="text-sm font-medium text-blue-950">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
