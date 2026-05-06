import { PanelCard } from '../../../components/ui/PanelCard'
import type { OrderItemDetails } from '../types/account.types'
import {
  getOrderItemCustomizationDetails,
  type CustomizationDetail,
} from '../utils/orderCustomizationDetails'
import {
  formatItemTotal,
  formatItemUnitPrice,
} from '../utils/orderFormatters'

type OrderItemsListProps = {
  items: OrderItemDetails[]
}

export function OrderItemsList({ items }: OrderItemsListProps) {
  return (
    <PanelCard
      eyebrow="Production"
      title="Produits commandés"
      description="Articles, quantités, prix et aperçu final quand il est disponible."
    >
      {items.length === 0 ? (
        <div className="rounded-[1rem] border border-dashed border-stone-200 bg-stone-50 px-4 py-8 text-center text-sm font-medium text-stone-500">
          Aucun produit n'est associé à cette commande.
        </div>
      ) : (
        <div className="grid min-w-0 gap-3">
          {items.map((item) => {
            const customizationDetails = getOrderItemCustomizationDetails(item)

            return (
              <article
                key={item.id}
                className="grid min-w-0 gap-4 rounded-[1rem] border border-stone-200 bg-white p-3 sm:grid-cols-[7rem_minmax(0,1fr)]"
              >
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[0.85rem] border border-stone-100 bg-stone-50">
                  {item.finalPreviewUrl ? (
                    <img
                      src={item.finalPreviewUrl}
                      alt={`Aperçu final ${item.productName}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="px-3 text-center text-xs font-semibold text-stone-400">
                      Aperçu à venir
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="break-words text-base font-semibold text-blue-950">
                        {item.productName}
                      </h3>
                      <p className="mt-1 text-sm text-stone-500">
                        Quantité : {item.quantity}
                      </p>
                    </div>
                    <div className="grid min-w-0 gap-1 text-sm sm:text-right">
                      <p className="break-words font-semibold text-blue-950">
                        {formatItemTotal(item)}
                      </p>
                      <p className="break-words text-stone-500">
                        {formatItemUnitPrice(item)} / pièce
                      </p>
                    </div>
                  </div>

                  <CustomizationDetails
                    hasCustomization={Boolean(item.customization)}
                    details={customizationDetails}
                  />
                </div>
              </article>
            )
          })}
        </div>
      )}
    </PanelCard>
  )
}

type CustomizationDetailsProps = {
  details: CustomizationDetail[]
  hasCustomization: boolean
}

function CustomizationDetails({
  details,
  hasCustomization,
}: CustomizationDetailsProps) {
  if (!hasCustomization) {
    return null
  }

  return (
    <div className="mt-3 rounded-[0.85rem] border border-emerald-100 bg-emerald-50 px-3 py-2.5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
        Personnalisation
      </p>
      {details.length > 0 ? (
        <dl className="mt-2 grid gap-2 sm:grid-cols-2">
          {details.map((detail) => (
            <div
              key={`${detail.label}-${detail.value}`}
              className="min-w-0 rounded-[0.75rem] border border-emerald-100 bg-white/80 px-3 py-2"
            >
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                {detail.label}
              </dt>
              <dd
                className={`mt-1 break-words text-sm font-semibold ${
                  detail.tone === 'success'
                    ? 'text-emerald-800'
                    : 'text-blue-950'
                }`}
              >
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-1 text-sm leading-5 text-emerald-900">
          Personnalisation enregistrée.
        </p>
      )}
    </div>
  )
}
