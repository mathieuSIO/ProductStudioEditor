import { useNavigate, useParams } from 'react-router-dom'

import { PanelCard } from '../../../components/ui/PanelCard'
import { OrderDetailsPanel } from '../../account/components/OrderDetailsPanel'
import { OrderItemsList } from '../../account/components/OrderItemsList'
import { formatOrderReference } from '../../account/utils/orderFormatters'
import { useAuth } from '../../auth'
import { AdminOrderStatusControl } from '../components/AdminOrderStatusControl'
import { useAdminOrderDetails } from '../hooks/useAdminOrderDetails'
import type { AdminOrderStatus } from '../types/admin.types'

export function AdminOrderDetailsPage() {
  const navigate = useNavigate()
  const { orderId } = useParams<{ orderId: string }>()
  const { logout } = useAuth()
  const {
    data: order,
    error,
    errorStatus,
    isLoading,
    isUpdatingStatus,
    statusError,
    updateStatus,
  } = useAdminOrderDetails(orderId ?? null)

  function handleReturnToOrders() {
    navigate('/admin/orders')
  }

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

  function handleStatusChange(status: AdminOrderStatus) {
    void updateStatus(status)
  }

  return (
    <section className="grid min-w-0 gap-4">
      <div className="flex flex-col gap-3 rounded-[1.25rem] border border-stone-200 bg-white px-4 py-5 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.28)] sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Administration
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">
            Détail commande
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Informations client, production et statut de commande.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-[0.95rem] border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-white hover:text-emerald-800"
            onClick={handleReturnToOrders}
          >
            Commandes
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

      {isLoading ? (
        <StateMessage
          title="Chargement de la commande"
            description="Récupération du détail admin."
        />
      ) : error ? (
        <StateMessage
          title="Commande admin indisponible"
          description={error}
          tone="error"
          actionLabel={errorStatus === 401 ? 'Se reconnecter' : 'Commandes'}
          onAction={errorStatus === 401 ? handleLogin : handleReturnToOrders}
        />
      ) : order ? (
        <div className="grid min-w-0 gap-4">
          <PanelCard
            eyebrow="Workflow"
            title={formatOrderReference(order)}
            description="Mise a jour du statut pour le suivi production."
          >
            <AdminOrderStatusControl
              error={statusError}
              isUpdating={isUpdatingStatus}
              status={order.status}
              onStatusChange={handleStatusChange}
            />
          </PanelCard>
          <OrderDetailsPanel order={order} />
          <OrderItemsList items={order.items} />
        </div>
      ) : (
        <StateMessage
          title="Aucune commande sélectionnée"
          description="Retournez à la liste pour choisir une commande."
          actionLabel="Commandes"
          onAction={handleReturnToOrders}
        />
      )}

      <button
        type="button"
        className="w-fit rounded-[0.95rem] border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
        onClick={handleReturnToStudio}
      >
        Retour studio
      </button>
    </section>
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
      className={`rounded-[1.25rem] border bg-white px-4 py-10 text-center shadow-[0_18px_42px_-36px_rgba(15,23,42,0.22)] ${className}`}
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
