import { PanelCard } from '../../../components/ui/PanelCard'
import { formatEuro } from '../../../shared/formatters/formatEuro'
import type { OrderDetails } from '../types/account.types'
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
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DetailStat label="Client" value={formatCustomerName(order)} />
        <DetailStat label="Email" value={formatCustomerEmail(order)} />
        <DetailStat label="Date" value={formatOrderDate(order.createdAt)} />
        <DetailStat label="Total" value={formatOrderTotal(order)} />
      </div>

      <div className="mt-4 rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-4">
        <p className="text-sm font-semibold text-blue-950">
          Adresse de livraison
        </p>
        <address className="mt-2 not-italic text-sm leading-6 text-stone-600">
          {formatShippingAddress(order)}
        </address>
      </div>
    </PanelCard>
  )
}

type DetailStatProps = {
  label: string
  value: string
}

function DetailStat({ label, value }: DetailStatProps) {
  return (
    <div className="rounded-[1rem] border border-stone-200 bg-white px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-blue-950">{value}</p>
    </div>
  )
}

function formatShippingAddress(order: OrderDetails) {
  const address = order.shippingAddress

  if (!address) {
    return 'Adresse non renseignée'
  }

  const cityLine = [address.postalCode, address.city].filter(Boolean).join(' ')
  const lines = [
    address.addressLine1,
    address.addressLine2,
    cityLine,
    address.country,
  ].filter(Boolean)

  return lines.length > 0 ? lines.join(', ') : 'Adresse non renseignée'
}

function formatOrderReference(order: OrderDetails) {
  return order.orderNumber ?? `Commande ${order.id}`
}

function formatCustomerName(order: OrderDetails) {
  const customerName = order.customerName ?? order.customer?.name

  if (customerName) {
    return customerName
  }

  const firstName = order.customer?.firstName
  const lastName = order.customer?.lastName
  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  return fullName.length > 0 ? fullName : 'Client MPM'
}

function formatCustomerEmail(order: OrderDetails) {
  return order.customerEmail ?? order.customer?.email ?? 'Email non renseigné'
}

function formatOrderDate(value?: string | null) {
  if (!value) {
    return 'Date non renseignée'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

function formatOrderTotal(order: OrderDetails) {
  if (typeof order.totalAmount === 'number') {
    return formatEuro(order.totalAmount)
  }

  if (typeof order.totalCents === 'number') {
    return formatEuro(order.totalCents / 100)
  }

  return 'Total à confirmer'
}
