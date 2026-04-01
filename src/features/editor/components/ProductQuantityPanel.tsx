import type { ProductSize } from '../types'

type ProductQuantityPanelProps = {
  quantities: Record<string, number>
  sizes: ProductSize[]
  totalQuantity: number
  onQuantityChange: (size: ProductSize, value: number) => void
}

export function ProductQuantityPanel({
  quantities,
  sizes,
  totalQuantity,
  onQuantityChange,
}: ProductQuantityPanelProps) {
  const isSingleSize = sizes.length === 1 && sizes[0] === 'TU'

  return (
    <div className="rounded-[1rem] border border-stone-200 bg-stone-50/80 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
            Quantites
          </p>
          <p className="mt-1 text-sm leading-5 text-stone-500">
            {isSingleSize
              ? 'Renseigne la quantite souhaitee pour ce produit.'
              : 'Indique la quantite par taille, puis verifie le total.'}
          </p>
        </div>
        <span className="rounded-full border border-stone-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
          {isSingleSize ? 'Taille unique' : `${sizes.length} tailles`}
        </span>
      </div>

      <div className="mt-2.5 grid gap-1.5">
        {sizes.map((size) => (
          <label
            key={size}
            className="flex items-center justify-between gap-3 rounded-[0.95rem] border border-stone-200 bg-white px-3 py-2"
          >
            <span className="text-sm font-medium text-stone-800">
              {size === 'TU' ? 'Taille unique' : size}
            </span>

            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={quantities[size] ?? 0}
              onChange={(event) => {
                const nextValue = Number(event.target.value)
                onQuantityChange(size, Number.isNaN(nextValue) ? 0 : nextValue)
              }}
              className="w-20 rounded-[0.8rem] border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-right text-sm font-medium text-stone-800 outline-none transition-colors focus:border-stone-400 focus:bg-white"
            />
          </label>
        ))}
      </div>

      <div className="mt-2.5 rounded-[0.95rem] border border-stone-200 bg-white px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
          Total
        </p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p className="text-sm text-stone-500">Quantite totale</p>
          <p className="text-lg font-semibold tracking-tight text-stone-950">
            {totalQuantity}
          </p>
        </div>
      </div>
    </div>
  )
}
