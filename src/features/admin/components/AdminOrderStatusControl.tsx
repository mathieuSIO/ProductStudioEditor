import { OrderStatusBadge } from '../../account/components/OrderStatusBadge'
import type { AdminOrderStatus } from '../types/admin.types'

const adminOrderStatuses = [
  'pending',
  'paid',
  'processing',
  'shipped',
  'completed',
  'cancelled',
] satisfies AdminOrderStatus[]

type AdminOrderStatusControlProps = {
  error: string | null
  isUpdating: boolean
  onStatusChange: (status: AdminOrderStatus) => void
  status: string
}

export function AdminOrderStatusControl({
  error,
  isUpdating,
  onStatusChange,
  status,
}: AdminOrderStatusControlProps) {
  return (
    <div className="rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-blue-950">Statut actuel</p>
          <div className="mt-2">
            <OrderStatusBadge status={status} />
          </div>
        </div>

        <label className="grid gap-1 text-sm font-semibold text-blue-950">
          Changer le statut
          <select
            className="min-w-52 rounded-[0.85rem] border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-blue-950 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
            disabled={isUpdating}
            value={isAdminOrderStatus(status) ? status : 'pending'}
            onChange={(event) =>
              onStatusChange(event.currentTarget.value as AdminOrderStatus)
            }
          >
            {adminOrderStatuses.map((orderStatus) => (
              <option key={orderStatus} value={orderStatus}>
                {formatAdminStatusLabel(orderStatus)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <p className="mt-3 rounded-[0.85rem] border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function formatAdminStatusLabel(status: AdminOrderStatus): string {
  const labels = {
    cancelled: 'Annulee',
    completed: 'Terminee',
    paid: 'Payee',
    pending: 'En attente',
    processing: 'En preparation',
    shipped: 'Expediee',
  } satisfies Record<AdminOrderStatus, string>

  return labels[status]
}

function isAdminOrderStatus(status: string): status is AdminOrderStatus {
  return adminOrderStatuses.some((orderStatus) => orderStatus === status)
}

