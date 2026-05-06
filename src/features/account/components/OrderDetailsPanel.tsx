import { PanelCard } from '../../../components/ui/PanelCard'
import type { OrderDetails } from '../types/account.types'
import {
  formatCustomerEmail,
  formatCustomerName,
  formatOrderDate,
  formatOrderReference,
  formatOrderTotal,
  formatShippingAddress,
} from '../utils/orderFormatters'
import { OrderStatusBadge } from './OrderStatusBadge'

type OrderDetailsPanelProps = {
  order: OrderDetails
}

export function OrderDetailsPanel({ order }: OrderDetailsPanelProps) {
  return (
    <PanelCard
      eyebrow="Commande"
      title={formatOrderReference(order)}
      description="Informations de suivi et de livraison."
      aside={<OrderStatusBadge status={order.status} />}
    >
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DetailStat label="Client" value={formatCustomerName(order)} />
        <DetailStat label="Email" value={formatCustomerEmail(order)} />
        <DetailStat label="Date" value={formatOrderDate(order.createdAt)} />
        <DetailStat label="Total" value={formatOrderTotal(order)} />
      </div>

      <div className="mt-4 rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-4">
        <p className="text-sm font-semibold text-blue-950">
          Adresse de livraison
        </p>
        <address className="mt-2 break-words not-italic text-sm leading-6 text-stone-600">
          {formatShippingAddress(order)}
        </address>
      </div>

      {order.options?.professionalLogoReview ? (
        <div className="mt-4 rounded-[1rem] border border-emerald-100 bg-emerald-50 px-4 py-4">
          <p className="text-sm font-semibold text-emerald-800">
            Vérification professionnelle du logo
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-900">
            Option choisie pour cette commande.
          </p>
        </div>
      ) : null}
    </PanelCard>
  )
}

type DetailStatProps = {
  label: string
  value: string
}

function DetailStat({ label, value }: DetailStatProps) {
  return (
    <div className="min-w-0 rounded-[1rem] border border-stone-200 bg-white px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-blue-950">
        {value}
      </p>
    </div>
  )
}
