import { useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../../auth'
import { AccountSidebar } from '../components/AccountSidebar'
import { OrderDetailsPanel } from '../components/OrderDetailsPanel'
import { OrderItemsList } from '../components/OrderItemsList'
import { useUserOrderDetails } from '../hooks/useUserOrderDetails'

export function OrderDetailsPage() {
  const navigate = useNavigate()
  const { orderId } = useParams<{ orderId: string }>()
  const { logout, user } = useAuth()
  const { data: order, error, errorStatus, isLoading } = useUserOrderDetails(
    orderId ?? null,
  )

  function handleReturnToOrders() {
    navigate('/account')
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

  return (
    <section className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)]">
      <AccountSidebar
        onLogout={handleLogout}
        onReturnToStudio={handleReturnToStudio}
        userName={formatUserName(user?.firstName, user?.lastName)}
      />

      <div className="min-w-0">
        <div className="mb-4 flex flex-col gap-3 rounded-[1.25rem] border border-stone-200 bg-white px-4 py-5 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.28)] sm:flex-row sm:items-start sm:justify-between sm:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Détail commande
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">
              Suivi de production
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Consultez les informations utiles pour votre commande textile.
            </p>
          </div>
          <button
            type="button"
            className="w-fit rounded-[0.95rem] border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-white hover:text-emerald-800"
            onClick={handleReturnToOrders}
          >
            Mes commandes
          </button>
        </div>

        {isLoading ? (
          <StateMessage
            title="Chargement de la commande"
            description="Nous récupérons les détails de production."
          />
        ) : error ? (
          <StateMessage
            title="Commande indisponible"
            description={error}
            tone="error"
            actionLabel={
              errorStatus === 401 ? 'Se reconnecter' : 'Mes commandes'
            }
            onAction={errorStatus === 401 ? handleLogin : handleReturnToOrders}
          />
        ) : order ? (
          <div className="grid min-w-0 gap-4">
            <OrderDetailsPanel order={order} />
            <OrderItemsList items={order.items} />
          </div>
        ) : (
          <StateMessage
            title="Aucune commande sélectionnée"
            description="Retournez à la liste pour choisir une commande."
            actionLabel="Mes commandes"
            onAction={handleReturnToOrders}
          />
        )}
      </div>
    </section>
  )
}

function formatUserName(
  firstName: string | undefined,
  lastName: string | undefined,
): string | undefined {
  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  return fullName.length > 0 ? fullName : undefined
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
