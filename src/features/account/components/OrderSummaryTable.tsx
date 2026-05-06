import type { OrderSummary } from '../types/account.types'
import {
  formatCustomerEmail,
  formatCustomerName,
  formatOrderDate,
  formatOrderReference,
  formatOrderTotal,
} from '../utils/orderFormatters'
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
      <table className="w-full table-fixed border-collapse text-left text-sm">
        <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
          <tr>
            <th className="w-[22%] px-4 py-3">Commande</th>
            <th className="w-[23%] px-4 py-3">Client</th>
            <th className="w-[16%] px-4 py-3">Date</th>
            <th className="w-[14%] px-4 py-3">Total</th>
            <th className="w-[14%] px-4 py-3">Statut</th>
            <th className="w-[11%] px-4 py-3 text-right">Détail</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {orders.map((order) => (
            <tr
              key={order.id}
              className="transition hover:bg-blue-50/60"
            >
              <td className="px-4 py-3">
                <p className="break-words font-semibold text-blue-950">
                  {formatOrderReference(order)}
                </p>
                <p className="mt-1 break-words text-xs text-stone-500">
                  ID {order.id}
                </p>
              </td>
              <td className="min-w-0 px-4 py-3 text-blue-900">
                <p className="break-words font-medium">
                  {formatCustomerName(order)}
                </p>
                <p className="mt-1 break-words text-xs text-stone-500">
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
                  Voir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
