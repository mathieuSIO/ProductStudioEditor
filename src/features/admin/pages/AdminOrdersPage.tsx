import { useNavigate } from 'react-router-dom'

import { PanelCard } from '../../../components/ui/PanelCard'
import { OrderStatusBadge } from '../../account/components/OrderStatusBadge'
import { getOrderItemPreviewImages } from '../../account/utils/orderItemPreviewImages'
import {
  formatCustomerEmail,
  formatCustomerName,
  formatOrderDate,
  formatOrderReference,
  formatOrderTotal,
} from '../../account/utils/orderFormatters'
import { useAuth } from '../../auth'
import { useAdminOrders } from '../hooks/useAdminOrders'
import type { AdminOrderSummary } from '../types/admin.types'

export function AdminOrdersPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { data: orders, error, errorStatus, isLoading } = useAdminOrders()

  function handleReturnToStudio() {
    navigate('/')
  }

  function handleLogin() {
    navigate('/login')
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function handleSelectOrder(orderId: string) {
    navigate(`/admin/orders/${orderId}`)
  }

  return (
    <section className="grid min-w-0 gap-4">
      <div className="rounded-[1.25rem] border border-stone-200 bg-white px-4 py-5 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.28)] sm:px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Administration
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">
              Commandes
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Suivi admin des commandes MPM, de la réception à l’expédition.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-[0.95rem] border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-white hover:text-emerald-800"
              onClick={() => navigate('/admin')}
            >
              Admin
            </button>
            <button
              type="button"
              className="rounded-[0.95rem] border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-white hover:text-emerald-800"
              onClick={() => navigate('/admin/custom-requests')}
            >
              Demandes personnalisÃ©es
            </button>
            <button
              type="button"
              className="rounded-[0.95rem] border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-white hover:text-emerald-800"
              onClick={handleReturnToStudio}
            >
              Studio
            </button>
            <button
              type="button"
              className="rounded-[0.95rem] bg-blue-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              onClick={handleLogout}
            >
              Deconnexion
            </button>
          </div>
        </div>
      </div>

      <PanelCard
        eyebrow="Back office"
        title="Commandes récentes"
        description="Tri récent vers ancien. Ouvrez une commande pour consulter les détails et modifier son statut."
        aside={
          <div className="rounded-[0.95rem] border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            {orders.length} commande{orders.length > 1 ? 's' : ''}
          </div>
        }
      >
        {isLoading ? (
          <StateMessage
            title="Chargement des commandes"
            description="Récupération de la liste admin."
          />
        ) : error ? (
          <StateMessage
            title="Commandes admin indisponibles"
            description={error}
            tone="error"
            actionLabel={errorStatus === 401 ? 'Se reconnecter' : 'Retour'}
            onAction={errorStatus === 401 ? handleLogin : handleReturnToStudio}
          />
        ) : orders.length === 0 ? (
          <StateMessage
            title="Aucune commande"
            description="Les futures commandes client apparaitront ici."
            actionLabel="Retour au studio"
            onAction={handleReturnToStudio}
          />
        ) : (
          <AdminOrdersTable
            orders={orders}
            onSelectOrder={handleSelectOrder}
          />
        )}
      </PanelCard>
    </section>
  )
}

type AdminOrdersTableProps = {
  onSelectOrder: (orderId: string) => void
  orders: AdminOrderSummary[]
}

function AdminOrdersTable({ onSelectOrder, orders }: AdminOrdersTableProps) {
  return (
    <div className="overflow-hidden rounded-[1.1rem] border border-stone-200 bg-white">
      <table className="w-full min-w-[860px] table-fixed border-collapse text-left text-sm">
        <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
          <tr>
            <th className="w-[14%] px-4 py-3">Aperçu</th>
            <th className="w-[18%] px-4 py-3">Commande</th>
            <th className="w-[22%] px-4 py-3">Client</th>
            <th className="w-[13%] px-4 py-3">Date</th>
            <th className="w-[12%] px-4 py-3">Total</th>
            <th className="w-[13%] px-4 py-3">Statut</th>
            <th className="w-[8%] px-4 py-3 text-right">Détail</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {orders.map((order) => (
            <tr key={order.id} className="transition hover:bg-blue-50/60">
              <td className="px-4 py-3">
                <OrderPrimaryPreview order={order} />
              </td>
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

type OrderPrimaryPreviewProps = {
  order: AdminOrderSummary
}

function OrderPrimaryPreview({ order }: OrderPrimaryPreviewProps) {
  const primaryImage = order.items
    ?.flatMap((item) => getOrderItemPreviewImages(item))
    .at(0)

  if (!primaryImage) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-[0.85rem] border border-dashed border-stone-200 bg-stone-50 px-2 text-center text-xs font-semibold text-stone-400">
        Aperçu à venir
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[0.85rem] border border-stone-100 bg-stone-50">
      <img
        src={primaryImage.url}
        alt={primaryImage.label}
        className="aspect-[4/3] w-full object-cover"
      />
    </div>
  )
}

type StateMessageProps = {
  actionLabel?: string
  description: string
  onAction?: () => void
  title: string
  tone?: 'default' | 'error'
}

function StateMessage({
  actionLabel,
  description,
  onAction,
  title,
  tone = 'default',
}: StateMessageProps) {
  const className =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-stone-200 bg-stone-50 text-stone-600'

  return (
    <div
      className={`rounded-[1rem] border px-4 py-8 text-center ${className}`}
    >
      <p className="text-base font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          className="mt-4 rounded-[0.95rem] bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
