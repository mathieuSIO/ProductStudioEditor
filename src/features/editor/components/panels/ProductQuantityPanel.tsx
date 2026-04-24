import type { ProductSize } from '../../types'

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
            Quantités
          </p>
          <p className="mt-1 text-sm leading-5 text-stone-500">
            {isSingleSize
              ? 'Renseigne la quantité souhaitée pour ce produit.'
              : 'Indique la quantité par taille, puis vérifie le total.'}
          </p>
        </div>
        <span className="rounded-full border border-stone-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
          {isSingleSize ? 'Taille unique' : `${sizes.length} tailles`}
        </span>
      </div>

      <div className="mt-2.5 grid gap-1.5">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(7.5rem,1fr))] gap-1.5">
          {sizes.map((size) => {
            const quantity = quantities[size] ?? 0

            return (
              <div
                key={size}
                className="rounded-[0.95rem] border border-stone-200 bg-white px-3 py-2.5"
              >
                <p className="text-center text-sm font-semibold text-stone-800">
                  {size === 'TU' ? 'Taille unique' : size}
                </p>

                <div className="mt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    aria-label={`Retirer une unité pour ${size === 'TU' ? 'taille unique' : size}`}
                    onClick={() => onQuantityChange(size, quantity - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-[0.8rem] border border-stone-200 bg-stone-50 text-base font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:bg-white"
                  >
                    -
                  </button>

                  <label className="sr-only" htmlFor={`quantity-${size}`}>
                    {size === 'TU' ? 'Quantité taille unique' : `Quantité ${size}`}
                  </label>
                  <input
                    id={`quantity-${size}`}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={quantity}
                    onChange={(event) => {
                      const nextValue = Number(event.target.value)
                      onQuantityChange(size, Number.isNaN(nextValue) ? 0 : nextValue)
                    }}
                    className="w-14 rounded-[0.8rem] border border-stone-200 bg-stone-50 px-2 py-1.5 text-center text-sm font-medium text-stone-800 outline-none transition-colors focus:border-stone-400 focus:bg-white"
                  />

                  <button
                    type="button"
                    aria-label={`Ajouter une unité pour ${size === 'TU' ? 'taille unique' : size}`}
                    onClick={() => onQuantityChange(size, quantity + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-[0.8rem] border border-stone-200 bg-stone-50 text-base font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:bg-white"
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-2.5 rounded-[0.95rem] border border-stone-200 bg-white px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
          Total
        </p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p className="text-sm text-stone-500">Quantité totale</p>
          <p className="text-lg font-semibold tracking-tight text-stone-950">
            {totalQuantity}
          </p>
        </div>
      </div>
    </div>
  )
}
