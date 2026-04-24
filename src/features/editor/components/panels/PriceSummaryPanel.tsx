import { formatEuro } from '../../../../shared/formatters/formatEuro'

type PriceSummaryPanelProps = {
  addToCartFeedbackMessage: string | null
  canAddToCart: boolean
  grandTotal: number
  onAddToCart?: () => void
  totalQuantity: number
}

export function PriceSummaryPanel({
  addToCartFeedbackMessage,
  canAddToCart,
  grandTotal,
  onAddToCart,
  totalQuantity,
}: PriceSummaryPanelProps) {
  const hasQuantity = totalQuantity > 0
  const unitPrice = hasQuantity ? grandTotal / totalQuantity : 0
  const isAddToCartDisabled = !canAddToCart || !onAddToCart

  return (
    <div className="rounded-[1rem] border border-stone-200 bg-stone-50/80 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
            Prix
          </p>
          <p className="mt-1 text-sm leading-5 text-stone-500">
            {hasQuantity
              ? 'Estimation simple basée sur le textile, la quantité et les impressions.'
              : 'Renseigne une quantité pour afficher une estimation tarifaire.'}
          </p>
        </div>
        <span className="rounded-full border border-stone-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
          V1
        </span>
      </div>

      <div className="mt-2.5 grid gap-1.5">
        <PriceRow label="Quantité totale" value={String(totalQuantity)} />
      </div>

      <div className="mt-2.5 rounded-[0.95rem] border border-stone-900 bg-stone-900 px-3 py-2.5 text-white">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-300">
          Total global
        </p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p className="text-sm text-stone-300">
            {hasQuantity ? 'Estimation actuelle' : 'En attente de quantité'}
          </p>
          <p className="text-lg font-semibold tracking-tight">
            {formatEuro(grandTotal)}
          </p>
        </div>
        <p className="mt-3 text-sm text-stone-300">
          Prix unitaire : {formatEuro(unitPrice)}
        </p>
      </div>

      <div className="mt-2.5 grid gap-2">
        <button
          type="button"
          className="rounded-[0.95rem] bg-stone-950 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:border disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-400"
          disabled={isAddToCartDisabled}
          onClick={onAddToCart}
        >
          Ajouter au panier
        </button>
        {addToCartFeedbackMessage ? (
          <p className="rounded-[0.85rem] border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-xs font-medium text-emerald-700">
            {addToCartFeedbackMessage}
          </p>
        ) : null}
      </div>
    </div>
  )
}

type PriceRowProps = {
  label: string
  value: string
}

function PriceRow({ label, value }: PriceRowProps) {
  return (
    <div className="rounded-[0.9rem] border border-stone-200 bg-white px-2.5 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-stone-800">{value}</p>
    </div>
  )
}
