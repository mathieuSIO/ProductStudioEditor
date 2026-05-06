import type { OrderSummary } from '../types/account.types'
import {
  formatCustomerEmail,
  formatCustomerName,
  formatOrderDate,
  formatOrderReference,
  formatOrderTotal,
} from '../utils/orderFormatters'
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
    <article className="min-w-0 rounded-[1.1rem] border border-stone-200 bg-white p-4 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.3)] lg:hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-base font-semibold text-blue-950">
            {formatOrderReference(order)}
          </p>
          <p className="mt-1 break-words text-xs text-stone-500">
            ID {order.id}
          </p>
        </div>
        <div className="shrink-0">
          <OrderStatusBadge status={order.status} />
        </div>
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
    <div className="grid grid-cols-[6rem_minmax(0,1fr)] items-start gap-3">
      <span className="text-stone-500">{label}</span>
      <span className="break-words text-right font-semibold text-blue-950">
        {value}
      </span>
    </div>
  )
}
