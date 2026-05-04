import { PanelCard } from '../../../components/ui/PanelCard'
import { formatEuro } from '../../../shared/formatters/formatEuro'
import type { OrderItemDetails } from '../types/account.types'

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
        <div className="grid gap-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="grid gap-4 rounded-[1rem] border border-stone-200 bg-white p-3 sm:grid-cols-[7rem_minmax(0,1fr)]"
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
                    <h3 className="text-base font-semibold text-blue-950">
                      {item.productName}
                    </h3>
                    <p className="mt-1 text-sm text-stone-500">
                      Quantité : {item.quantity}
                    </p>
                  </div>
                  <div className="grid gap-1 text-sm sm:text-right">
                    <p className="font-semibold text-blue-950">
                      {formatItemTotal(item)}
                    </p>
                    <p className="text-stone-500">
                      {formatItemUnitPrice(item)} / pièce
                    </p>
                  </div>
                </div>

                {item.customization ? (
                  <div className="mt-3 rounded-[0.85rem] border border-emerald-100 bg-emerald-50 px-3 py-2.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                      Personnalisation
                    </p>
                    <p className="mt-1 text-sm leading-5 text-emerald-900">
                      Données de personnalisation enregistrées pour cet
                      article.
                    </p>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </PanelCard>
  )
}

function formatItemUnitPrice(item: OrderItemDetails) {
  if (typeof item.unitPrice === 'number') {
    return formatEuro(item.unitPrice)
  }

  if (typeof item.unitPriceCents === 'number') {
    return formatEuro(item.unitPriceCents / 100)
  }

  return 'Prix à confirmer'
}

function formatItemTotal(item: OrderItemDetails) {
  if (typeof item.priceTotal === 'number') {
    return formatEuro(item.priceTotal)
  }

  if (typeof item.totalPriceCents === 'number') {
    return formatEuro(item.totalPriceCents / 100)
  }

  if (typeof item.unitPriceCents === 'number') {
    return formatEuro((item.unitPriceCents * item.quantity) / 100)
  }

  if (typeof item.unitPrice === 'number') {
    return formatEuro(item.unitPrice * item.quantity)
  }

  return 'Total à confirmer'
}
