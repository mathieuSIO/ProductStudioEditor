import { Link } from 'react-router-dom'

import { PanelCard } from '../../../components/ui/PanelCard'
import type { OrderDetails } from '../types/account.types'

type CustomerOrderRelayPointPanelProps = {
  order: OrderDetails
}

export function CustomerOrderRelayPointPanel({
  order,
}: CustomerOrderRelayPointPanelProps) {
  const relayPoint = order.relayPoint

  if (order.shippingMethod !== 'mondial_relay' || !relayPoint) {
    return null
  }

  if (order.status === 'paid' && relayPoint.selectionStatus === 'pending') {
    return (
      <PanelCard
        eyebrow="Mondial Relay"
        title="Point Relais à sélectionner"
        description="Votre commande est payée, mais vous devez encore choisir votre Point Relais avant son expédition."
      >
        <Link
          to={`/compte/commandes/${encodeURIComponent(order.id)}/relais`}
          className="inline-flex min-h-10 items-center justify-center rounded-[0.85rem] bg-blue-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        >
          Choisir mon Point Relais
        </Link>
      </PanelCard>
    )
  }

  if (relayPoint.selectionStatus !== 'selected') {
    return null
  }

  const cityLine = [relayPoint.postalCode, relayPoint.city]
    .filter(isAvailableValue)
    .join(' ')
  const addressLines = [
    relayPoint.name,
    relayPoint.addressLine1,
    relayPoint.addressLine2,
    cityLine,
  ].filter(isAvailableValue)

  return (
    <PanelCard
      eyebrow="Mondial Relay"
      title="Votre Point Relais"
      description="Point de retrait enregistré pour cette commande."
    >
      {addressLines.length > 0 ? (
        <address className="grid gap-1 break-words not-italic text-sm leading-6 text-stone-700">
          {addressLines.map((line, index) => (
            <span key={`${index}-${line}`}>{line}</span>
          ))}
        </address>
      ) : null}

      {relayPoint.id ? (
        <p className="mt-3 text-xs font-semibold text-stone-500">
          Point Relais n° {relayPoint.id}
        </p>
      ) : null}
    </PanelCard>
  )
}

function isAvailableValue(value: string | null): value is string {
  return typeof value === 'string' && value.trim().length > 0
}
