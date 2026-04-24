import { formatEuro } from '../../../shared/formatters/formatEuro'
import type { CartItem, CartItemId } from '../types'

type CartItemCardProps = {
  item: CartItem
  onRemove: (itemId: CartItemId) => void
}

export function CartItemCard({ item, onRemove }: CartItemCardProps) {
  const quantityEntries = Object.entries(item.quantities).filter(
    ([, quantity]) => typeof quantity === 'number' && quantity > 0,
  )
  const logosCount = item.design.views.reduce(
    (total, view) => total + view.logos.length,
    0,
  )
  const hasTemporaryLogoPreview = item.design.views.some((view) =>
    view.logos.some(
      (logo) => logo.previewPersistence === 'temporary-object-url',
    ),
  )

  return (
    <article className="rounded-[1rem] border border-stone-200 bg-white p-3 shadow-[0_16px_38px_-30px_rgba(28,25,23,0.2)] sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-stone-950">
              {item.product.name}
            </h2>
            <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              {item.pricing.totalQuantity} pièces
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm text-stone-600">
            <span
              className="h-4 w-4 rounded-full border border-stone-300"
              style={{ backgroundColor: item.color.swatchHex }}
            />
            <span>{item.color.label}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
          <p className="text-lg font-semibold tracking-tight text-stone-950">
            {formatEuro(item.pricing.grandTotal)}
          </p>
          <button
            type="button"
            className="rounded-[0.8rem] border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={() => onRemove(item.id)}
          >
            Supprimer
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <CartMeta label="Quantités" value={formatQuantities(quantityEntries)} />
        <CartMeta label="Logos" value={String(logosCount)} />
        <CartMeta label="Impression" value={formatEuro(item.pricing.printTotal)} />
      </div>

      {item.design.customPlacement ? (
        <p className="mt-3 rounded-[0.9rem] border border-stone-200 bg-stone-50 px-3 py-2 text-sm leading-5 text-stone-600">
          {item.design.customPlacement}
        </p>
      ) : null}

      {hasTemporaryLogoPreview ? (
        <p className="mt-3 rounded-[0.9rem] border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-5 text-amber-800">
          Aperçu disponible pendant cette session uniquement.
        </p>
      ) : null}
    </article>
  )
}

type CartMetaProps = {
  label: string
  value: string
}

function CartMeta({ label, value }: CartMetaProps) {
  return (
    <div className="rounded-[0.9rem] border border-stone-200 bg-stone-50 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-stone-800">{value}</p>
    </div>
  )
}

function formatQuantities(entries: [string, number | undefined][]) {
  if (entries.length === 0) {
    return 'Aucune'
  }

  return entries.map(([size, quantity]) => `${size}: ${quantity}`).join(', ')
}
