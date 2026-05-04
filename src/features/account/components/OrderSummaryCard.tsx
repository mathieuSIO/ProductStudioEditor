import { formatEuro } from '../../../shared/formatters/formatEuro'
import type { OrderSummary } from '../types/account.types'
import { OrderStatusBadge } from './OrderStatusBadge'

type OrderSummaryCardProps = {
  onSelectOrder: (orderId: string) => void
  order: OrderSummary
}

export function OrderSummaryCard({
  onSelectOrder,
  order,
}: OrderSummaryCardProps) {
  return (
    <article className="rounded-[1.1rem] border border-stone-200 bg-white p-4 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.3)] lg:hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-semibold text-blue-950">
            {formatOrderReference(order)}
          </p>
          <p className="mt-1 text-xs text-stone-500">ID {order.id}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-4 grid gap-2 text-sm">
        <InfoRow label="Client" value={formatCustomerName(order)} />
        <InfoRow label="Email" value={formatCustomerEmail(order)} />
        <InfoRow label="Date" value={formatOrderDate(order.createdAt)} />
        <InfoRow label="Total" value={formatOrderTotal(order)} />
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-[0.95rem] bg-blue-950 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        onClick={() => onSelectOrder(order.id)}
      >
        Voir le détail
      </button>
    </article>
  )
}

type InfoRowProps = {
  label: string
  value: string
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-stone-500">{label}</span>
      <span className="text-right font-semibold text-blue-950">{value}</span>
    </div>
  )
}

function formatOrderReference(order: OrderSummary) {
  return order.orderNumber ?? `Commande ${order.id}`
}

function formatCustomerName(order: OrderSummary) {
  const customerName = order.customerName ?? order.customer?.name

  if (customerName) {
    return customerName
  }

  const firstName = order.customer?.firstName
  const lastName = order.customer?.lastName
  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  return fullName.length > 0 ? fullName : 'Client MPM'
}

function formatCustomerEmail(order: OrderSummary) {
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

function formatOrderTotal(order: OrderSummary) {
  if (typeof order.totalAmount === 'number') {
    return formatEuro(order.totalAmount)
  }

  if (typeof order.totalCents === 'number') {
    return formatEuro(order.totalCents / 100)
  }

  return 'Total à confirmer'
}
