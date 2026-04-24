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

const reassuranceItems = [
  'Fabrication en France',
  'Accompagnement humain',
  'Vérification logo possible',
]

export function CartSummaryPanel({
  isCheckoutDisabled,
  onContinueToCheckout,
  onProfessionalLogoReviewChange,
  options,
  totals,
}: CartSummaryPanelProps) {
  return (
    <aside className="h-fit rounded-[1.25rem] border border-blue-100 bg-white p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.4)] lg:sticky lg:top-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-600">
          Résumé
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-blue-950">
          Finaliser votre demande
        </h2>
      </div>

      <div className="mt-4 grid gap-2">
        <SummaryRow label="Sous-total" value={formatEuro(totals.subtotal)} />

        <label className="flex cursor-pointer items-start gap-3 rounded-[0.95rem] border border-blue-100 bg-blue-50 px-3 py-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-blue-200 text-red-600"
            checked={options.professionalLogoReview}
            onChange={(event) =>
              onProfessionalLogoReviewChange(event.currentTarget.checked)
            }
          />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-blue-950">
              Vérification professionnelle du logo
            </span>
            <span className="mt-1 block text-sm font-medium text-blue-700">
              +{formatEuro(professionalLogoReviewPrice)}
            </span>
          </span>
        </label>

        <SummaryRow label="Options" value={formatEuro(totals.optionsTotal)} />
      </div>

      <div className="mt-4 rounded-[1.05rem] border border-blue-950 bg-blue-950 px-4 py-4 text-white">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-100">
          Total final
        </p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">
          {formatEuro(totals.total)}
        </p>
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-[1rem] bg-red-600 px-4 py-3.5 text-base font-semibold text-white shadow-[0_18px_38px_-28px_rgba(220,38,38,0.75)] transition hover:bg-red-700 disabled:cursor-not-allowed disabled:border disabled:border-blue-100 disabled:bg-blue-50 disabled:text-blue-300 disabled:shadow-none"
        disabled={isCheckoutDisabled}
        onClick={onContinueToCheckout}
      >
        Continuer vers la validation →
      </button>

      <div className="mt-4 grid gap-2 rounded-[1rem] border border-blue-100 bg-blue-50 px-3 py-3">
        {reassuranceItems.map((item) => (
          <div key={item} className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-red-600">
              ✓
            </span>
            <span className="text-sm font-medium text-blue-950">{item}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}

type SummaryRowProps = {
  label: string
  value: string
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[0.95rem] border border-blue-100 bg-white px-3 py-2.5 text-sm">
      <span className="font-medium text-blue-700">{label}</span>
      <span className="font-semibold text-blue-950">{value}</span>
    </div>
  )
}
