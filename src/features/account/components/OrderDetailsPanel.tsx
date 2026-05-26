import { PanelCard } from '../../../components/ui/PanelCard'
import { formatEuro } from '../../../shared/formatters/formatEuro'
import type { OrderDetails } from '../types/account.types'
import {
  formatCustomerEmail,
  formatCustomerName,
  formatOrderDate,
  formatOrderReference,
  formatOrderTotal,
  formatShippingAddress,
} from '../utils/orderFormatters'
import { OrderStatusBadge } from './OrderStatusBadge'

type OrderDetailsPanelProps = {
  order: OrderDetails
}

export function OrderDetailsPanel({ order }: OrderDetailsPanelProps) {
  return (
    <PanelCard
      eyebrow="Commande"
      title={formatOrderReference(order)}
      description="Informations de suivi et de livraison."
      aside={<OrderStatusBadge status={order.status} />}
    >
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DetailStat label="Client" value={formatCustomerName(order)} />
        <DetailStat label="Email" value={formatCustomerEmail(order)} />
        <DetailStat label="Date" value={formatOrderDate(order.createdAt)} />
        <DetailStat label="Total" value={formatOrderTotal(order)} />
      </div>

      <div className="mt-4 rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-4">
        <p className="text-sm font-semibold text-blue-950">
          Adresse de livraison
        </p>
        <address className="mt-2 break-words not-italic text-sm leading-6 text-stone-600">
          {formatShippingAddress(order)}
        </address>
      </div>

      <div className="mt-4 rounded-[1rem] border border-blue-100 bg-blue-50 px-4 py-4">
        <p className="text-sm font-semibold text-blue-950">Livraison</p>

        {hasShipmentDetails(order) ? (
          <>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {order.shipment?.shippingLabel ? (
              <OptionStat
                label="Mode"
                value={order.shipment.shippingLabel}
              />
            ) : null}

            {typeof order.shipment?.shippingPriceCents === 'number' ? (
              <OptionStat
                label="Prix"
                value={formatEuro(order.shipment.shippingPriceCents / 100)}
              />
            ) : null}

            {typeof order.shipment?.totalWeightGrams === 'number' ? (
              <OptionStat
                label="Poids"
                value={formatWeight(order.shipment.totalWeightGrams)}
              />
            ) : null}

            {getShipmentStatus(order) ? (
              <OptionStat
                label="Statut livraison"
                value={formatShipmentStatus(getShipmentStatus(order))}
              />
            ) : null}

            {order.shipment?.trackingNumber ? (
              <OptionStat
                label="Numero de suivi"
                value={order.shipment.trackingNumber}
              />
            ) : null}
          </div>

          {order.shipment?.relayPointName ||
          order.shipment?.relayPointAddress ? (
            <p className="mt-3 break-words text-sm leading-6 text-blue-800">
              {[order.shipment.relayPointName, order.shipment.relayPointAddress]
                .filter(Boolean)
                .join(', ')}
            </p>
          ) : null}

          {order.shipment?.trackingUrl ? (
            <a
              className="mt-3 inline-flex min-h-10 items-center justify-center rounded-[0.9rem] bg-blue-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              href={order.shipment.trackingUrl}
              rel="noreferrer"
              target="_blank"
            >
              Suivre mon colis
            </a>
          ) : null}
          </>
        ) : (
          <p className="mt-2 text-sm leading-6 text-blue-800">
            Votre commande est en préparation.
          </p>
        )}
      </div>

      {hasOrderOptions(order) ? (
        <div className="mt-4 rounded-[1rem] border border-emerald-100 bg-emerald-50 px-4 py-4">
          <p className="text-sm font-semibold text-emerald-800">
            Options de commande
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {order.options?.professionalLogoReview ? (
              <OptionStat
                label="Vérification logo"
                value={
                  typeof order.options.professionalLogoReviewPriceCents ===
                  'number'
                    ? formatEuro(
                        order.options.professionalLogoReviewPriceCents / 100,
                      )
                    : 'Option choisie'
                }
              />
            ) : null}

            {order.options?.productionLabel ? (
              <OptionStat
                label="Délai de production"
                value={formatProductionOption(order)}
              />
            ) : null}

            {typeof order.options?.productionPriceCents === 'number' ? (
              <OptionStat
                label="Supplément production"
                value={formatEuro(order.options.productionPriceCents / 100)}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </PanelCard>
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

function OptionStat({ label, value }: DetailStatProps) {
  return (
    <div className="min-w-0 rounded-[0.85rem] border border-emerald-100 bg-white/80 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-blue-950">
        {value}
      </p>
    </div>
  )
}

function hasOrderOptions(order: OrderDetails): boolean {
  return Boolean(
    order.options?.professionalLogoReview ||
      order.options?.productionLabel ||
      typeof order.options?.productionPriceCents === 'number',
  )
}

function hasShipmentDetails(order: OrderDetails): boolean {
  return Boolean(
    order.shipment?.shippingLabel ||
      typeof order.shipment?.shippingPriceCents === 'number' ||
      typeof order.shipment?.totalWeightGrams === 'number' ||
      order.shipment?.shippingStatus ||
      order.shipment?.status ||
      order.shipment?.relayPointName ||
      order.shipment?.relayPointAddress ||
      order.shipment?.trackingNumber,
  )
}

function getShipmentStatus(order: OrderDetails): string | null {
  return order.shipment?.shippingStatus ?? order.shipment?.status ?? null
}

function formatShipmentStatus(status: string | null): string {
  switch (status) {
    case 'delivered':
      return 'Livrée'
    case 'failed':
      return 'Incident livraison'
    case 'label_created':
      return 'Étiquette créée'
    case 'pending':
    case null:
      return 'En préparation'
    case 'shipped':
      return 'Expédiée'
    default:
      return status
  }
}

function formatProductionOption(order: OrderDetails): string {
  const productionLabel = order.options?.productionLabel ?? 'Production'

  if (typeof order.options?.productionPercentage !== 'number') {
    return productionLabel
  }

  return `${productionLabel} (+${formatPercentage(order.options.productionPercentage)})`
}

function formatPercentage(value: number): string {
  const normalizedValue = value > 1 ? value : value * 100

  return `${Math.round(normalizedValue)} %`
}

function formatWeight(weightGrams: number): string {
  if (weightGrams >= 1000) {
    return `${(weightGrams / 1000).toLocaleString('fr-FR', {
      maximumFractionDigits: 1,
    })} kg`
  }

  return `${weightGrams.toLocaleString('fr-FR')} g`
}
