import { useNavigate } from 'react-router-dom'

import { PanelCard } from '../../../components/ui/PanelCard'
import { useAuth } from '../../auth'
import { AccountSidebar } from '../components/AccountSidebar'
import { OrderSummaryCard } from '../components/OrderSummaryCard'
import { OrderSummaryTable } from '../components/OrderSummaryTable'
import { useUserOrders } from '../hooks/useUserOrders'

export function AccountDashboardPage() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { data: orders, error, errorStatus, isLoading } = useUserOrders()

  function handleReturnToStudio() {
    navigate('/')
  }

  function handleSelectOrder(orderId: string) {
    navigate(`/account/orders/${orderId}`)
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
        <div className="mb-4 rounded-[1.25rem] border border-stone-200 bg-white px-4 py-5 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.28)] sm:px-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Historique
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">
                Mes commandes
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                Retrouvez vos demandes de personnalisation textile, leur statut
                et les aperçus finaux transmis à la production.
              </p>
            </div>
            <div className="w-fit rounded-[0.95rem] border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
              {orders.length} commande{orders.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <PanelCard
          eyebrow="Suivi"
          title="Commandes récentes"
          description="Cliquez sur une ligne pour ouvrir le détail de production."
        >
          {isLoading ? (
            <StateMessage
              title="Chargement des commandes"
              description="Nous récupérons votre historique."
            />
          ) : error ? (
            <StateMessage
              title="Commandes indisponibles"
              description={error}
              tone="error"
              actionLabel={
                errorStatus === 401 ? 'Se reconnecter' : 'Retour au studio'
              }
              onAction={errorStatus === 401 ? handleLogin : handleReturnToStudio}
            />
          ) : orders.length === 0 ? (
            <StateMessage
              title="Aucune commande pour le moment"
              description="Vos prochaines personnalisations MPM apparaîtront ici."
              actionLabel="Retour au studio"
              onAction={handleReturnToStudio}
            />
          ) : (
            <>
              <OrderSummaryTable
                orders={orders}
                onSelectOrder={handleSelectOrder}
              />
              <div className="grid min-w-0 gap-3 lg:hidden">
                {orders.map((order) => (
                  <OrderSummaryCard
                    key={order.id}
                    order={order}
                    onSelectOrder={handleSelectOrder}
                  />
                ))}
              </div>
            </>
          )}
        </PanelCard>
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
