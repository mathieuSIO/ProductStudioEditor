import type { OrderStatus } from '../types/account.types'

type OrderStatusBadgeProps = {
  status: OrderStatus
}

const statusLabels: Record<string, string> = {
  cancelled: 'Annulée',
  delivered: 'Livrée',
  draft: 'Brouillon',
  paid: 'Payée',
  pending: 'En attente',
  processing: 'En préparation',
  received: 'Reçue',
  shipped: 'Expédiée',
}

const statusClassNames: Record<string, string> = {
  cancelled: 'border-red-200 bg-red-50 text-red-700',
  delivered: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  draft: 'border-stone-200 bg-stone-50 text-stone-600',
  paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  processing: 'border-blue-200 bg-blue-50 text-blue-700',
  received: 'border-blue-200 bg-blue-50 text-blue-700',
  shipped: 'border-indigo-200 bg-indigo-50 text-indigo-700',
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const normalizedStatus = status.toLowerCase()
  const label = statusLabels[normalizedStatus] ?? status
  const className =
    statusClassNames[normalizedStatus] ??
    'border-stone-200 bg-stone-50 text-stone-700'

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  )
}
