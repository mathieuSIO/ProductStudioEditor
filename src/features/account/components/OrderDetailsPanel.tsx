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

      {hasShipmentDetails(order) ? (
        <div className="mt-4 rounded-[1rem] border border-blue-100 bg-blue-50 px-4 py-4">
          <p className="text-sm font-semibold text-blue-950">
            Livraison
          </p>
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

            {order.shipment?.status ? (
              <OptionStat
                label="Statut livraison"
                value={order.shipment.status}
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

          {order.shipment?.trackingNumber ? (
            <p className="mt-3 text-sm font-medium text-blue-950">
              Suivi :{' '}
              {order.shipment.trackingUrl ? (
                <a
                  className="font-semibold text-emerald-700 underline-offset-4 hover:underline"
                  href={order.shipment.trackingUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {order.shipment.trackingNumber}
                </a>
              ) : (
                <span>{order.shipment.trackingNumber}</span>
              )}
            </p>
          ) : null}
        </div>
      ) : null}

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
      order.shipment?.status ||
      order.shipment?.relayPointName ||
      order.shipment?.relayPointAddress ||
      order.shipment?.trackingNumber,
  )
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
