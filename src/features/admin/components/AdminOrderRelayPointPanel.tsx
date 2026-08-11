import { PanelCard } from '../../../components/ui/PanelCard'
import { formatOrderDateTime } from '../../account/utils/orderFormatters'
import type { AdminOrderDetails } from '../types/admin.types'

type AdminOrderRelayPointPanelProps = {
  order: AdminOrderDetails
}

export function AdminOrderRelayPointPanel({
  order,
}: AdminOrderRelayPointPanelProps) {
  const relayPoint = order.relayPoint

  if (order.shippingMethod !== 'mondial_relay' || !relayPoint) {
    return null
  }

  if (relayPoint.selectionStatus === 'pending') {
    return (
      <PanelCard eyebrow="Mondial Relay" title="Mondial Relay">
        <div className="rounded-[1rem] border border-amber-300 bg-amber-50 p-4 text-amber-950">
          <p className="text-sm font-bold uppercase tracking-[0.12em]">
            Action requise
          </p>
          <p className="mt-2 text-sm font-semibold">
            Le client n’a pas encore sélectionné son Point Relais.
          </p>
          <p className="mt-2 text-sm leading-6">
            L’expédition ne doit pas être préparée tant que le Point Relais
            n’est pas sélectionné.
          </p>
        </div>
      </PanelCard>
    )
  }

  if (relayPoint.selectionStatus !== 'selected') {
    return null
  }

  const selectedAt = formatOrderDateTime(relayPoint.selectedAt)

  return (
    <PanelCard
      eyebrow="Mondial Relay"
      title="Point Relais Mondial Relay"
      description="Données officielles enregistrées pour la préparation de l’expédition."
    >
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        <RelayDetail label="ID" value={relayPoint.id} />
        <RelayDetail label="Nom" value={relayPoint.name} />
        <RelayDetail label="Adresse" value={relayPoint.addressLine1} />
        <RelayDetail label="Complément" value={relayPoint.addressLine2} />
        <RelayDetail label="Code postal" value={relayPoint.postalCode} />
        <RelayDetail label="Ville" value={relayPoint.city} />
        <RelayDetail label="Pays" value={relayPoint.country} />
      </div>

      {selectedAt ? (
        <p className="mt-4 text-sm font-semibold text-emerald-800">
          Sélectionné le {selectedAt}
        </p>
      ) : null}
    </PanelCard>
  )
}

type RelayDetailProps = {
  label: string
  value: string | null
}

function RelayDetail({ label, value }: RelayDetailProps) {
  if (!value?.trim()) {
    return null
  }

  return (
    <div className="min-w-0 rounded-[0.85rem] border border-emerald-100 bg-emerald-50/60 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-blue-950">
        {value}
      </p>
    </div>
  )
}
