import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { PanelCard } from '../../../components/ui/PanelCard'
import { formatEuro } from '../../../shared/formatters/formatEuro'
import { useAuth } from '../../auth'
import {
  AdminPromoCodesApiError,
  createAdminPromoCode,
  fetchAdminPromoCodes,
  updateAdminPromoCodeStatus,
  type AdminPromoCode,
  type CreateAdminPromoCodePayload,
  type PromoCodeDiscountType,
} from '../api/adminPromoCodesApi'

type PromoCodeFormData = {
  code: string
  discountType: PromoCodeDiscountType
  discountValue: string
  expiresAt: string
  isActive: boolean
  maxUses: string
  minimumOrderCents: string
  startsAt: string
}

const emptyFormData: PromoCodeFormData = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  expiresAt: '',
  isActive: true,
  maxUses: '',
  minimumOrderCents: '0',
  startsAt: '',
}

export function AdminPromoCodesPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [promoCodes, setPromoCodes] = useState<AdminPromoCode[]>([])
  const [formData, setFormData] = useState<PromoCodeFormData>(emptyFormData)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [updatingPromoCodeId, setUpdatingPromoCodeId] = useState<number | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)
  const [errorStatus, setErrorStatus] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    void loadPromoCodes()
  }, [])

  async function loadPromoCodes() {
    setIsLoading(true)
    setError(null)
    setErrorStatus(null)

    try {
      const loadedPromoCodes = await fetchAdminPromoCodes()
      setPromoCodes(
        [...loadedPromoCodes].sort((firstPromoCode, secondPromoCode) =>
          firstPromoCode.code.localeCompare(secondPromoCode.code),
        ),
      )
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Les codes promo sont indisponibles.',
      )
      setErrorStatus(
        loadError instanceof AdminPromoCodesApiError ? loadError.status : null,
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function handleLogin() {
    navigate('/login')
  }

  function updateFormField<Field extends keyof PromoCodeFormData>(
    field: Field,
    value: PromoCodeFormData[Field],
  ) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }))
  }

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setSuccess(null)

    const payload = createPromoCodePayload(formData)

    if (!payload) {
      return
    }

    setIsCreating(true)

    try {
      await createAdminPromoCode(payload)
      setFormData(emptyFormData)
      setSuccess('Code promo cree.')
      await loadPromoCodes()
    } catch (createError) {
      setFormError(
        createError instanceof Error
          ? createError.message
          : "Le code promo n'a pas pu etre cree.",
      )
    } finally {
      setIsCreating(false)
    }
  }

  async function handleToggleStatus(promoCode: AdminPromoCode) {
    setSuccess(null)
    setFormError(null)
    setUpdatingPromoCodeId(promoCode.id)

    try {
      await updateAdminPromoCodeStatus(promoCode.id, !promoCode.isActive)
      setSuccess(
        promoCode.isActive ? 'Code promo desactive.' : 'Code promo reactive.',
      )
      await loadPromoCodes()
    } catch (updateError) {
      setFormError(
        updateError instanceof Error
          ? updateError.message
          : "Le statut du code promo n'a pas pu etre modifie.",
      )
    } finally {
      setUpdatingPromoCodeId(null)
    }
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
              Codes promo
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Creez les codes promo et activez ou desactivez leur utilisation.
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
        eyebrow="Creation"
        title="Nouveau code promo"
        description="Les montants fixes et minimums sont saisis en centimes pour rester alignes avec le backend."
      >
        <form className="grid gap-4" onSubmit={handleCreateSubmit}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <FormField
              label="Code"
              name="code"
              onChange={(value) => updateFormField('code', value.toUpperCase())}
              required
              value={formData.code}
            />
            <label className="grid gap-1.5 text-sm font-semibold text-blue-950">
              Type
              <select
                className="rounded-[0.9rem] border border-stone-200 bg-white px-3 py-3 text-sm font-medium text-stone-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                value={formData.discountType}
                onChange={(event) =>
                  updateFormField(
                    'discountType',
                    event.currentTarget.value as PromoCodeDiscountType,
                  )
                }
              >
                <option value="percentage">percentage</option>
                <option value="fixed_amount">fixed_amount</option>
              </select>
            </label>
            <FormField
              label="Valeur"
              name="discountValue"
              onChange={(value) => updateFormField('discountValue', value)}
              required
              type="number"
              value={formData.discountValue}
            />
            <FormField
              label="Minimum commande (centimes)"
              name="minimumOrderCents"
              onChange={(value) => updateFormField('minimumOrderCents', value)}
              type="number"
              value={formData.minimumOrderCents}
            />
            <FormField
              label="Utilisations max"
              name="maxUses"
              onChange={(value) => updateFormField('maxUses', value)}
              type="number"
              value={formData.maxUses}
            />
            <FormField
              label="Debut"
              name="startsAt"
              onChange={(value) => updateFormField('startsAt', value)}
              type="datetime-local"
              value={formData.startsAt}
            />
            <FormField
              label="Expiration"
              name="expiresAt"
              onChange={(value) => updateFormField('expiresAt', value)}
              type="datetime-local"
              value={formData.expiresAt}
            />
            <label className="flex items-center gap-2 rounded-[0.9rem] border border-stone-200 bg-stone-50 px-3 py-3 text-sm font-semibold text-blue-950">
              <input
                checked={formData.isActive}
                className="h-4 w-4 accent-emerald-700"
                type="checkbox"
                onChange={(event) =>
                  updateFormField('isActive', event.currentTarget.checked)
                }
              />
              Actif
            </label>
          </div>

          <Feedback error={formError} success={success} />

          <button
            type="submit"
            className="w-fit rounded-[0.95rem] bg-blue-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-400"
            disabled={isCreating}
          >
            {isCreating ? 'Creation...' : 'Creer le code promo'}
          </button>
        </form>
      </PanelCard>

      <PanelCard
        eyebrow="Back office"
        title="Codes promo existants"
        description="Desactivez un code pour conserver l'historique sans le rendre utilisable."
        aside={
          <div className="rounded-[0.95rem] border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            {promoCodes.length} code{promoCodes.length > 1 ? 's' : ''}
          </div>
        }
      >
        {isLoading ? (
          <StateMessage
            title="Chargement des codes promo"
            description="Recuperation de la liste admin."
          />
        ) : error ? (
          <StateMessage
            title="Codes promo indisponibles"
            description={error}
            tone="error"
            actionLabel={errorStatus === 401 ? 'Se reconnecter' : 'Retour'}
            onAction={errorStatus === 401 ? handleLogin : () => navigate('/admin')}
          />
        ) : promoCodes.length === 0 ? (
          <StateMessage
            title="Aucun code promo"
            description="Les codes crees apparaitront ici."
          />
        ) : (
          <PromoCodesTable
            promoCodes={promoCodes}
            updatingPromoCodeId={updatingPromoCodeId}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </PanelCard>
    </section>
  )
}

type PromoCodesTableProps = {
  onToggleStatus: (promoCode: AdminPromoCode) => void
  promoCodes: AdminPromoCode[]
  updatingPromoCodeId: number | null
}

function PromoCodesTable({
  onToggleStatus,
  promoCodes,
  updatingPromoCodeId,
}: PromoCodesTableProps) {
  return (
    <div className="overflow-hidden rounded-[1.1rem] border border-stone-200 bg-white">
      <table className="w-full min-w-[1040px] table-fixed border-collapse text-left text-sm">
        <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
          <tr>
            <th className="w-[12%] px-4 py-3">Code</th>
            <th className="w-[13%] px-4 py-3">Type</th>
            <th className="w-[10%] px-4 py-3">Valeur</th>
            <th className="w-[13%] px-4 py-3">Minimum</th>
            <th className="w-[12%] px-4 py-3">Utilisations</th>
            <th className="w-[13%] px-4 py-3">Debut</th>
            <th className="w-[13%] px-4 py-3">Expiration</th>
            <th className="w-[8%] px-4 py-3">Statut</th>
            <th className="w-[6%] px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {promoCodes.map((promoCode) => (
            <tr key={promoCode.id} className="transition hover:bg-blue-50/60">
              <td className="px-4 py-3 font-semibold text-blue-950">
                {promoCode.code}
              </td>
              <td className="px-4 py-3 text-stone-600">
                {promoCode.discountType}
              </td>
              <td className="px-4 py-3 font-semibold text-blue-950">
                {formatDiscountValue(promoCode)}
              </td>
              <td className="px-4 py-3 text-stone-600">
                {formatEuro(promoCode.minimumOrderCents / 100)}
              </td>
              <td className="px-4 py-3 text-stone-600">
                {promoCode.currentUses} / {promoCode.maxUses ?? '∞'}
              </td>
              <td className="px-4 py-3 text-stone-600">
                {formatDate(promoCode.startsAt)}
              </td>
              <td className="px-4 py-3 text-stone-600">
                {formatDate(promoCode.expiresAt)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge isActive={promoCode.isActive} />
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  className={`rounded-[0.85rem] px-3 py-2 text-sm font-semibold transition ${
                    promoCode.isActive
                      ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-white'
                      : 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-white'
                  }`}
                  disabled={updatingPromoCodeId === promoCode.id}
                  onClick={() => onToggleStatus(promoCode)}
                >
                  {getToggleLabel(promoCode, updatingPromoCodeId)}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatusBadge({ isActive }: Pick<AdminPromoCode, 'isActive'>) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        isActive
          ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
          : 'border-stone-200 bg-stone-100 text-stone-600'
      }`}
    >
      {isActive ? 'Actif' : 'Inactif'}
    </span>
  )
}

type FormFieldProps = {
  label: string
  name: string
  onChange: (value: string) => void
  required?: boolean
  type?: 'datetime-local' | 'number' | 'text'
  value: string
}

function FormField({
  label,
  name,
  onChange,
  required = false,
  type = 'text',
  value,
}: FormFieldProps) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-blue-950">
      {label}
      <input
        className="rounded-[0.9rem] border border-stone-200 bg-white px-3 py-3 text-sm font-medium text-stone-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
        min={type === 'number' ? 0 : undefined}
        name={name}
        onChange={(event) => onChange(event.currentTarget.value)}
        required={required}
        type={type}
        value={value}
      />
    </label>
  )
}

type FeedbackProps = {
  error: string | null
  success: string | null
}

function Feedback({ error, success }: FeedbackProps) {
  if (error) {
    return (
      <div className="rounded-[1rem] border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
        {error}
      </div>
    )
  }

  if (success) {
    return (
      <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800">
        {success}
      </div>
    )
  }

  return null
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

function createPromoCodePayload(
  formData: PromoCodeFormData,
): CreateAdminPromoCodePayload | null {
  const discountValue = Number(formData.discountValue)
  const minimumOrderCents = Number(formData.minimumOrderCents)
  const maxUses = formData.maxUses.trim() ? Number(formData.maxUses) : null

  if (!formData.code.trim() || !Number.isFinite(discountValue)) {
    return null
  }

  if (!Number.isFinite(minimumOrderCents)) {
    return null
  }

  if (maxUses !== null && !Number.isFinite(maxUses)) {
    return null
  }

  return {
    code: formData.code.trim().toUpperCase(),
    discountType: formData.discountType,
    discountValue,
    expiresAt: normalizeDateTime(formData.expiresAt),
    isActive: formData.isActive,
    maxUses,
    minimumOrderCents,
    startsAt: normalizeDateTime(formData.startsAt),
  }
}

function normalizeDateTime(value: string): string | null {
  if (!value.trim()) {
    return null
  }

  return new Date(value).toISOString()
}

function formatDiscountValue(promoCode: AdminPromoCode): string {
  if (promoCode.discountType === 'percentage') {
    return `${promoCode.discountValue} %`
  }

  return formatEuro(promoCode.discountValue / 100)
}

function formatDate(value: string | null): string {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getToggleLabel(
  promoCode: AdminPromoCode,
  updatingPromoCodeId: number | null,
): string {
  if (updatingPromoCodeId === promoCode.id) {
    return '...'
  }

  return promoCode.isActive ? 'Desactiver' : 'Reactiver'
}
