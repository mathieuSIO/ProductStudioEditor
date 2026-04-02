type PriceSummaryPanelProps = {
  grandTotal: number
  printTotal: number
  textileTotal: number
  totalQuantity: number
}

export function PriceSummaryPanel({
  grandTotal,
  //printTotal, utile pour l'administrateur ou le developpeur
  //textileTotal, utile pour l'administrateur ou le developpeur
  totalQuantity,
}: PriceSummaryPanelProps) {
  const hasQuantity = totalQuantity > 0

  return (
    <div className="rounded-[1rem] border border-stone-200 bg-stone-50/80 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
            Prix
          </p>
          <p className="mt-1 text-sm leading-5 text-stone-500">
            {hasQuantity
              ? 'Estimation simple basee sur le textile, la quantite et les impressions.'
              : 'Renseigne une quantite pour afficher une estimation tarifaire.'}
          </p>
        </div>
        <span className="rounded-full border border-stone-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
          V1
        </span>
      </div>

      <div className="mt-2.5 grid gap-1.5">
        <PriceRow label="Quantite totale" value={String(totalQuantity)} />

        {/* utile pour l'administrateur ou le developpeur
        <PriceRow label="Total textile" value={formatEuro(textileTotal)} />
        <PriceRow label="Total impression" value={formatEuro(printTotal)} /> */}
      </div>

      <div className="mt-2.5 rounded-[0.95rem] border border-stone-900 bg-stone-900 px-3 py-2.5 text-white">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-300">
          Total global
        </p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p className="text-sm text-stone-300">
            {hasQuantity ? 'Estimation actuelle' : 'En attente de quantite'}
          </p>
          <p className="text-xl font-semibold tracking-tight">
            {formatEuro(grandTotal)}
          </p>
        </div>
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

function formatEuro(value: number) {
  return `${value.toFixed(2)} €`
}
