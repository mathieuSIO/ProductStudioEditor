import { formatEuro } from '../../../shared/formatters/formatEuro'
import type { OrderSummary } from '../types/account.types'
import { OrderStatusBadge } from './OrderStatusBadge'

type OrderSummaryTableProps = {
  onSelectOrder: (orderId: string) => void
  orders: OrderSummary[]
}

export function OrderSummaryTable({
  onSelectOrder,
  orders,
}: OrderSummaryTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-[1.1rem] border border-stone-200 bg-white lg:block">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
          <tr>
            <th className="px-4 py-3">Commande</th>
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Statut</th>
            <th className="px-4 py-3 text-right">Détail</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {orders.map((order) => (
            <tr
              key={order.id}
              className="transition hover:bg-blue-50/60"
            >
              <td className="px-4 py-3">
                <p className="font-semibold text-blue-950">
                  {formatOrderReference(order)}
                </p>
                <p className="mt-1 text-xs text-stone-500">ID {order.id}</p>
              </td>
              <td className="px-4 py-3 text-blue-900">
                <p className="font-medium">{formatCustomerName(order)}</p>
                <p className="mt-1 text-xs text-stone-500">
                  {formatCustomerEmail(order)}
                </p>
              </td>
              <td className="px-4 py-3 text-stone-600">
                {formatOrderDate(order.createdAt)}
              </td>
              <td className="px-4 py-3 font-semibold text-blue-950">
                {formatOrderTotal(order)}
              </td>
              <td className="px-4 py-3">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  className="rounded-[0.85rem] border border-blue-100 bg-white px-3 py-2 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                  onClick={() => onSelectOrder(order.id)}
                >
                  Voir le détail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
