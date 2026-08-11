import { Link } from 'react-router-dom'

import type { CustomerOrderSummary } from '../types/account.types'

type OrderRelaySelectionStatusProps = {
  className?: string
  compact?: boolean
  order: CustomerOrderSummary
}

export function OrderRelaySelectionStatus({
  className = '',
  compact = false,
  order,
}: OrderRelaySelectionStatusProps) {
  const requiresRelaySelection =
    order.status === 'paid' &&
    order.shippingMethod === 'mondial_relay' &&
    order.relaySelectionStatus === 'pending'
  const hasSelectedRelayPoint =
    order.shippingMethod === 'mondial_relay' &&
    order.relaySelectionStatus === 'selected'

  if (requiresRelaySelection) {
    return (
      <div
        className={`${className} rounded-[0.9rem] border border-amber-200 bg-amber-50 text-amber-950 ${
          compact ? 'p-2.5' : 'p-3.5'
        }`}
      >
        <p className="text-sm font-semibold">Action requise</p>
        <p className="mt-1 text-xs leading-5">
          Choisissez votre Point Relais pour permettre l’expédition de votre
          commande.
        </p>
        <Link
          to={`/compte/commandes/${encodeURIComponent(order.id)}/relais`}
          className="mt-2 inline-flex min-h-9 items-center justify-center rounded-[0.75rem] bg-blue-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-amber-200"
        >
          Choisir mon Point Relais
        </Link>
      </div>
    )
  }

  if (hasSelectedRelayPoint) {
    return (
      <p className={`${className} inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800`}>
        Point Relais sélectionné
      </p>
    )
  }

  return null
}
