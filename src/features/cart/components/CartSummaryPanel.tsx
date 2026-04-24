import { formatEuro } from '../../../shared/formatters/formatEuro'
import { professionalLogoReviewPrice } from '../constants'
import type { CartOptions, CartTotals } from '../types'

type CartSummaryPanelProps = {
  isCheckoutDisabled: boolean
  onContinueToCheckout: () => void
  onProfessionalLogoReviewChange: (enabled: boolean) => void
  options: CartOptions
  totals: CartTotals
}

export function CartSummaryPanel({
  isCheckoutDisabled,
  onContinueToCheckout,
  onProfessionalLogoReviewChange,
  options,
  totals,
}: CartSummaryPanelProps) {
  return (
    <aside className="rounded-[1rem] border border-stone-200 bg-white p-3 shadow-[0_16px_38px_-30px_rgba(28,25,23,0.2)] sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
            Panier
          </p>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-stone-950">
            Total commande
          </h2>
        </div>
        <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
          V1
        </span>
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-[0.95rem] border border-stone-200 bg-stone-50 px-3 py-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-stone-300 text-stone-950"
          checked={options.professionalLogoReview}
          onChange={(event) =>
            onProfessionalLogoReviewChange(event.currentTarget.checked)
          }
        />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-stone-800">
            Vérification professionnelle du logo
          </span>
          <span className="mt-1 block text-sm text-stone-500">
            +{formatEuro(professionalLogoReviewPrice)}
          </span>
        </span>
      </label>

      <div className="mt-4 grid gap-2">
        <SummaryRow label="Sous-total" value={formatEuro(totals.subtotal)} />
        <SummaryRow label="Options" value={formatEuro(totals.optionsTotal)} />
      </div>

      <div className="mt-3 rounded-[0.95rem] border border-stone-900 bg-stone-900 px-3 py-3 text-white">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-300">
          Total
        </p>
        <p className="mt-1 text-xl font-semibold tracking-tight">
          {formatEuro(totals.total)}
        </p>
      </div>

      <button
        type="button"
        className="mt-3 w-full rounded-[0.95rem] bg-stone-950 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:border disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-400"
        disabled={isCheckoutDisabled}
        onClick={onContinueToCheckout}
      >
        Continuer vers la validation
      </button>
    </aside>
  )
}

type SummaryRowProps = {
  label: string
  value: string
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[0.85rem] border border-stone-200 bg-stone-50 px-3 py-2 text-sm">
      <span className="text-stone-500">{label}</span>
      <span className="font-semibold text-stone-900">{value}</span>
    </div>
  )
}
