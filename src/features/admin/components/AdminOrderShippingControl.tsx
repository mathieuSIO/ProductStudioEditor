import { useEffect, useState, type FormEvent } from 'react'

import type { OrderShipment } from '../../account'
import type {
  AdminShippingStatus,
  UpdateAdminOrderShippingPayload,
} from '../types/admin.types'

const shippingStatuses = [
  'pending',
  'label_created',
  'shipped',
  'delivered',
  'failed',
] satisfies AdminShippingStatus[]

type AdminOrderShippingControlProps = {
  error: string | null
  isUpdating: boolean
  onShippingUpdate: (payload: UpdateAdminOrderShippingPayload) => void
  shipment?: OrderShipment | null
  success: string | null
}

type ShippingFormData = {
  status: AdminShippingStatus
  trackingNumber: string
  trackingUrl: string
}

export function AdminOrderShippingControl({
  error,
  isUpdating,
  onShippingUpdate,
  shipment,
  success,
}: AdminOrderShippingControlProps) {
  const [formData, setFormData] = useState<ShippingFormData>(() =>
    createShippingFormData(shipment),
  )

  useEffect(() => {
    setFormData(createShippingFormData(shipment))
  }, [shipment])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onShippingUpdate(createShippingPayload(formData))
  }

  function updateField(field: keyof ShippingFormData, value: string) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }))
  }

  return (
    <div className="grid gap-4 rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <DetailStat
          label="Tracking actuel"
          value={shipment?.trackingNumber ?? 'Non renseigne'}
        />
        <DetailStat
          label="URL actuelle"
          value={shipment?.trackingUrl ?? 'Non renseignee'}
        />
        <DetailStat
          label="Statut transport"
          value={formatShippingStatusLabel(readShipmentStatus(shipment))}
        />
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_14rem]">
          <FormField
            label="Tracking number"
            name="trackingNumber"
            onChange={(value) => updateField('trackingNumber', value)}
            value={formData.trackingNumber}
          />
          <FormField
            label="Tracking URL"
            name="trackingUrl"
            onChange={(value) => updateField('trackingUrl', value)}
            type="url"
            value={formData.trackingUrl}
          />
          <label className="grid gap-1 text-sm font-semibold text-blue-950">
            Statut livraison
            <select
              className="rounded-[0.85rem] border border-stone-200 bg-white px-3 py-3 text-sm font-semibold text-blue-950 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
              disabled={isUpdating}
              value={formData.status}
              onChange={(event) => updateField('status', event.currentTarget.value)}
            >
              {shippingStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatShippingStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? (
          <p className="rounded-[0.85rem] border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="rounded-[0.85rem] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          className="w-fit rounded-[0.95rem] bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-400"
          disabled={isUpdating}
        >
          {isUpdating ? 'Mise a jour...' : 'Enregistrer le suivi'}
        </button>
      </form>
    </div>
  )
}

type DetailStatProps = {
  label: string
  value: string
}

function DetailStat({ label, value }: DetailStatProps) {
  return (
    <div className="min-w-0 rounded-[0.85rem] border border-stone-200 bg-white px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-blue-950">
        {value}
      </p>
    </div>
  )
}

type FormFieldProps = {
  label: string
  name: string
  onChange: (value: string) => void
  type?: 'text' | 'url'
  value: string
}

function FormField({
  label,
  name,
  onChange,
  type = 'text',
  value,
}: FormFieldProps) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-blue-950">
      {label}
      <input
        className="rounded-[0.85rem] border border-stone-200 bg-white px-3 py-3 text-sm font-medium text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
        name={name}
        onChange={(event) => onChange(event.currentTarget.value)}
        type={type}
        value={value}
      />
    </label>
  )
}

function createShippingFormData(
  shipment: OrderShipment | null | undefined,
): ShippingFormData {
  return {
    status: readShipmentStatus(shipment),
    trackingNumber: shipment?.trackingNumber ?? '',
    trackingUrl: shipment?.trackingUrl ?? '',
  }
}

function createShippingPayload(
  formData: ShippingFormData,
): UpdateAdminOrderShippingPayload {
  return {
    status: formData.status,
    trackingNumber: formatNullableValue(formData.trackingNumber),
    trackingUrl: formatNullableValue(formData.trackingUrl),
  }
}

function formatNullableValue(value: string): string | null {
  const formattedValue = value.trim()

  return formattedValue.length > 0 ? formattedValue : null
}

function readShipmentStatus(
  shipment: OrderShipment | null | undefined,
): AdminShippingStatus {
  return readShippingStatus(shipment?.shippingStatus ?? shipment?.status)
}

function readShippingStatus(
  status: string | null | undefined,
): AdminShippingStatus {
  return shippingStatuses.find((shippingStatus) => shippingStatus === status) ??
    'pending'
}

function formatShippingStatusLabel(status: AdminShippingStatus): string {
  const labels = {
    delivered: 'Livree',
    failed: 'Echec',
    label_created: 'Etiquette creee',
    pending: 'En attente',
    shipped: 'Expediee',
  } satisfies Record<AdminShippingStatus, string>

  return labels[status]
}
