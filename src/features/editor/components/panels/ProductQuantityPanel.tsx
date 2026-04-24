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
    <section className="overflow-hidden rounded-[1.25rem] border border-blue-100 bg-white shadow-[0_16px_38px_-32px_rgba(15,23,42,0.3)]">
      <div className="flex flex-col gap-3 border-b border-blue-100 bg-blue-50 px-3.5 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-600">
            Quantités
          </p>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-blue-950">
            Choisissez vos quantités
          </h2>
          <p className="mt-1 text-sm leading-5 text-stone-500">
            Le prix s’ajuste automatiquement selon les quantités.
          </p>
        </div>

        <div className="rounded-[1rem] border border-blue-100 bg-white px-3 py-2 text-center shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
            Total
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-red-600">
            {totalQuantity}
          </p>
          <p className="text-xs font-medium text-blue-950">
            {totalQuantity > 1 ? 'pièces' : 'pièce'}
          </p>
        </div>
      </div>

      <div className="grid gap-2.5 p-3">
        <div className="flex items-center justify-between gap-2 rounded-[0.95rem] border border-blue-100 bg-white px-3 py-2">
          <p className="text-sm font-medium text-blue-950">
            {isSingleSize
              ? 'Taille unique disponible'
              : `${sizes.length} tailles disponibles`}
          </p>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">
            Total : {totalQuantity} {totalQuantity > 1 ? 'pièces' : 'pièce'}
          </span>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-2">
          {sizes.map((size) => {
            const quantity = quantities[size] ?? 0
            const hasQuantity = quantity > 0

            return (
              <div
                key={size}
                className={`rounded-[1rem] border px-3 py-3 transition-colors ${
                  hasQuantity
                    ? 'border-red-200 bg-red-50 shadow-[0_16px_30px_-28px_rgba(220,38,38,0.4)]'
                    : 'border-blue-100 bg-blue-50/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-sm font-semibold ${
                      hasQuantity ? 'text-red-700' : 'text-blue-950'
                    }`}
                  >
                    {size === 'TU' ? 'Taille unique' : size}
                  </p>
                  {hasQuantity ? (
                    <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-600">
                      Sélectionnée
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    aria-label={`Retirer une unité pour ${
                      size === 'TU' ? 'taille unique' : size
                    }`}
                    onClick={() => onQuantityChange(size, quantity - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] border border-blue-100 bg-white text-lg font-semibold text-blue-950 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    -
                  </button>

                  <label className="sr-only" htmlFor={`quantity-${size}`}>
                    {size === 'TU'
                      ? 'Quantité taille unique'
                      : `Quantité ${size}`}
                  </label>
                  <input
                    id={`quantity-${size}`}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={quantity}
                    onChange={(event) => {
                      const nextValue = Number(event.target.value)
                      onQuantityChange(
                        size,
                        Number.isNaN(nextValue) ? 0 : nextValue,
                      )
                    }}
                    className={`h-10 w-14 min-w-[3rem] rounded-[0.9rem] border border-blue-100 bg-white px-2 text-center text-base font-semibold tabular-nums text-blue-950 outline-none transition-colors focus:border-blue-400 ${
                      hasQuantity
                        ? 'border-red-200 text-red-700 focus:border-red-500'
                        : ''
                    }`}
                  />

                  <button
                    type="button"
                    aria-label={`Ajouter une unité pour ${
                      size === 'TU' ? 'taille unique' : size
                    }`}
                    onClick={() => onQuantityChange(size, quantity + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-blue-950 text-lg font-semibold text-white transition-colors hover:bg-red-600"
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
