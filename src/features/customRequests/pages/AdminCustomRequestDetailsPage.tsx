import { useNavigate, useParams } from 'react-router-dom'

import { PanelCard } from '../../../components/ui/PanelCard'
import { useAuth } from '../../auth'
import { useAdminCustomRequestDetails } from '../hooks/useAdminCustomRequestDetails'
import type { CustomRequestStatus } from '../types'
import {
  formatCustomRequestCustomer,
  formatCustomRequestDate,
  formatCustomRequestStatus,
} from '../utils/customRequestFormatters'

const customRequestStatuses = [
  'new',
  'in_progress',
  'quoted',
  'closed',
] satisfies CustomRequestStatus[]

export function AdminCustomRequestDetailsPage() {
  const navigate = useNavigate()
  const { requestId } = useParams<{ requestId: string }>()
  const { logout } = useAuth()
  const {
    data: request,
    error,
    errorStatus,
    isLoading,
    isUpdatingStatus,
    statusError,
    statusSuccess,
    updateStatus,
  } = useAdminCustomRequestDetails(requestId ?? null)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function handleStatusChange(status: CustomRequestStatus) {
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
            Detail demande
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Informations client, brief complet et statut de traitement.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-[0.95rem] border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-white hover:text-emerald-800"
            onClick={() => navigate('/admin/custom-requests')}
          >
            Demandes
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
          title="Chargement de la demande"
          description="Recuperation du detail admin."
        />
      ) : error ? (
        <StateMessage
          title="Demande indisponible"
          description={error}
          tone="error"
          actionLabel={
            errorStatus === 401 ? 'Se reconnecter' : 'Demandes'
          }
          onAction={
            errorStatus === 401
              ? () => navigate('/login')
              : () => navigate('/admin/custom-requests')
          }
        />
      ) : request ? (
        <div className="grid min-w-0 gap-4">
          <PanelCard
            eyebrow="Demande"
            title={`Demande #${request.id}`}
            description={`Creee le ${formatCustomRequestDate(request.createdAt)}.`}
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <DetailStat
                label="Client"
                value={formatCustomRequestCustomer(request)}
              />
              <DetailStat label="Email" value={request.customerEmail} />
              <DetailStat
                label="Telephone"
                value={request.customerPhone ?? 'Non renseigne'}
              />
              <DetailStat
                label="Statut"
                value={formatCustomRequestStatus(request.status)}
              />
            </div>

            <div className="mt-4 rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-4">
              <p className="text-sm font-semibold text-blue-950">
                Message client
              </p>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-stone-700">
                {request.message}
              </p>
            </div>
          </PanelCard>

          <PanelCard
            eyebrow="Workflow"
            title="Statut de traitement"
            description="Mettez a jour l'avancement de la demande personnalisee."
          >
            <div className="rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-4">
              <label className="grid gap-1 text-sm font-semibold text-blue-950 sm:max-w-xs">
                Changer le statut
                <select
                  className="rounded-[0.85rem] border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-blue-950 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
                  disabled={isUpdatingStatus}
                  value={request.status}
                  onChange={(event) =>
                    handleStatusChange(
                      event.currentTarget.value as CustomRequestStatus,
                    )
                  }
                >
                  {customRequestStatuses.map((status) => (
                    <option key={status} value={status}>
                      {formatCustomRequestStatus(status)}
                    </option>
                  ))}
                </select>
              </label>

              {statusError ? (
                <p className="mt-3 rounded-[0.85rem] border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                  {statusError}
                </p>
              ) : null}

              {statusSuccess ? (
                <p className="mt-3 rounded-[0.85rem] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                  {statusSuccess}
                </p>
              ) : null}
            </div>
          </PanelCard>
        </div>
      ) : (
        <StateMessage
          title="Aucune demande selectionnee"
          description="Retournez a la liste pour choisir une demande."
          actionLabel="Demandes"
          onAction={() => navigate('/admin/custom-requests')}
        />
      )}
    </section>
  )
}

type DetailStatProps = {
  label: string
  value: string
}

function DetailStat({ label, value }: DetailStatProps) {
  return (
    <div className="min-w-0 rounded-[1rem] border border-stone-200 bg-white px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-blue-950">
        {value}
      </p>
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
