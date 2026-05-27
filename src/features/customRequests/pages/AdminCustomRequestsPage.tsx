import { useNavigate } from 'react-router-dom'

import { PanelCard } from '../../../components/ui/PanelCard'
import { useAuth } from '../../auth'
import { useAdminCustomRequests } from '../hooks/useAdminCustomRequests'
import type { CustomRequest } from '../types'
import {
  formatCustomRequestCustomer,
  formatCustomRequestDate,
  formatCustomRequestStatus,
} from '../utils/customRequestFormatters'

export function AdminCustomRequestsPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { data: requests, error, errorStatus, isLoading } =
    useAdminCustomRequests()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function handleLogin() {
    navigate('/login')
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
              Demandes personnalisees
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Suivez les demandes libres envoyees depuis le studio.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-[0.95rem] border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-white hover:text-emerald-800"
              onClick={() => navigate('/admin/orders')}
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
      </div>

      <PanelCard
        eyebrow="Back office"
        title="Demandes recentes"
        description="Ouvrez une demande pour lire le brief complet et changer son statut."
        aside={
          <div className="rounded-[0.95rem] border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            {requests.length} demande{requests.length > 1 ? 's' : ''}
          </div>
        }
      >
        {isLoading ? (
          <StateMessage
            title="Chargement des demandes"
            description="Recuperation de la liste admin."
          />
        ) : error ? (
          <StateMessage
            title="Demandes indisponibles"
            description={error}
            tone="error"
            actionLabel={errorStatus === 401 ? 'Se reconnecter' : 'Commandes'}
            onAction={errorStatus === 401 ? handleLogin : () => navigate('/admin/orders')}
          />
        ) : requests.length === 0 ? (
          <StateMessage
            title="Aucune demande"
            description="Les futures demandes personnalisees apparaitront ici."
            actionLabel="Commandes"
            onAction={() => navigate('/admin/orders')}
          />
        ) : (
          <CustomRequestsTable
            requests={requests}
            onSelectRequest={(requestId) =>
              navigate(`/admin/custom-requests/${requestId}`)
            }
          />
        )}
      </PanelCard>
    </section>
  )
}

type CustomRequestsTableProps = {
  onSelectRequest: (requestId: number) => void
  requests: CustomRequest[]
}

function CustomRequestsTable({
  onSelectRequest,
  requests,
}: CustomRequestsTableProps) {
  return (
    <div className="overflow-hidden rounded-[1.1rem] border border-stone-200 bg-white">
      <table className="w-full min-w-[760px] table-fixed border-collapse text-left text-sm">
        <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
          <tr>
            <th className="w-[10%] px-4 py-3">ID</th>
            <th className="w-[22%] px-4 py-3">Client</th>
            <th className="w-[28%] px-4 py-3">Email</th>
            <th className="w-[16%] px-4 py-3">Date</th>
            <th className="w-[14%] px-4 py-3">Statut</th>
            <th className="w-[10%] px-4 py-3 text-right">Detail</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {requests.map((request) => (
            <tr key={request.id} className="transition hover:bg-blue-50/60">
              <td className="px-4 py-3 font-semibold text-blue-950">
                {request.id}
              </td>
              <td className="px-4 py-3 text-blue-900">
                {formatCustomRequestCustomer(request)}
              </td>
              <td className="px-4 py-3 text-stone-600">
                {request.customerEmail}
              </td>
              <td className="px-4 py-3 text-stone-600">
                {formatCustomRequestDate(request.createdAt)}
              </td>
              <td className="px-4 py-3">
                <StatusPill status={request.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  className="rounded-[0.85rem] border border-blue-100 bg-white px-3 py-2 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                  onClick={() => onSelectRequest(request.id)}
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

function StatusPill({ status }: Pick<CustomRequest, 'status'>) {
  return (
    <span className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
      {formatCustomRequestStatus(status)}
    </span>
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
    <div className={`rounded-[1rem] border px-4 py-8 text-center ${className}`}>
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
