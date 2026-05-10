import { formatEuro } from '../../../shared/formatters/formatEuro'
import {
  getPreviewImages,
  type PreviewImage,
} from '../../../shared/utils/previewImages'
import type { CartItem, CartItemId } from '../types'

type CartItemCardProps = {
  item: CartItem
  onRemove: (itemId: CartItemId) => void
}

export function CartItemCard({ item, onRemove }: CartItemCardProps) {
  const quantityEntries = Object.entries(item.quantities).filter(
    ([, quantity]) => typeof quantity === 'number' && quantity > 0,
  )
  const logosCount = item.design.views.reduce(
    (total, view) => total + view.logos.length,
    0,
  )
  const hasTemporaryLogoPreview = item.design.views.some((view) =>
    view.logos.some(
      (logo) => logo.previewPersistence === 'temporary-object-url',
    ),
  )
  const previewImages = getPreviewImages({
    finalPreviewUrl: item.finalPreviewUrl,
    finalPreviewUrls: item.design.finalPreviewUrls,
  })

  return (
    <article className="overflow-hidden rounded-[1.25rem] border border-blue-100 bg-white shadow-[0_16px_38px_-34px_rgba(15,23,42,0.3)]">
      <div className="flex flex-col gap-3 border-b border-blue-100 bg-blue-50/70 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-blue-950">
              {item.product.name}
            </h2>
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-600 ring-1 ring-red-100">
              {item.pricing.totalQuantity} pièces
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm font-medium text-blue-800">
            <span
              className="h-4 w-4 rounded-full border border-blue-100 shadow-sm"
              style={{ backgroundColor: item.color.swatchHex }}
            />
            <span>{item.color.label}</span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 sm:flex-col sm:items-end">
          <div className="text-left sm:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
              Prix item
            </p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-blue-950">
              {formatEuro(item.pricing.grandTotal)}
            </p>
          </div>
          <button
            type="button"
            className="text-sm font-semibold text-blue-500 underline-offset-4 transition hover:text-red-600 hover:underline"
            onClick={() => onRemove(item.id)}
          >
            Supprimer
          </button>
        </div>
      </div>

      <div className="grid gap-3 px-4 py-3.5">
        <div className="grid gap-2 sm:grid-cols-3">
          <CartMeta label="Quantités" value={formatQuantities(quantityEntries)} />
          <CartMeta label="Logos" value={String(logosCount)} />
          <CartMeta
            label="Impression"
            value={formatEuro(item.pricing.printTotal)}
          />
        </div>

        {item.design.customPlacement ? (
          <p className="rounded-[0.95rem] border border-blue-100 bg-blue-50 px-3 py-2 text-sm leading-5 text-blue-800">
            {item.design.customPlacement}
          </p>
        ) : null}

        <CartPreviewImages images={previewImages} />

        {hasTemporaryLogoPreview ? (
          <p className="rounded-[0.95rem] border border-blue-100 bg-white px-3 py-2 text-sm leading-5 text-blue-700">
            Aperçu disponible pendant cette session uniquement.
          </p>
        ) : null}
      </div>
    </article>
  )
}

type CartMetaProps = {
  label: string
  value: string
}

type CartPreviewImagesProps = {
  images: PreviewImage[]
}

function CartPreviewImages({ images }: CartPreviewImagesProps) {
  if (images.length === 0) {
    return (
      <div className="flex min-h-28 items-center justify-center rounded-[0.95rem] border border-dashed border-blue-100 bg-blue-50 px-3 py-4 text-center text-sm font-semibold text-blue-400">
        Apercu a venir
      </div>
    )
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {images.map((image) => (
        <figure
          key={`${image.viewId}-${image.url}`}
          className="overflow-hidden rounded-[0.95rem] border border-blue-100 bg-white"
        >
          <div className="aspect-[4/3] bg-blue-50">
            <img
              src={image.url}
              alt={`Apercu final ${image.label}`}
              className="h-full w-full object-cover"
            />
          </div>
          <figcaption className="border-t border-blue-100 px-3 py-2 text-xs font-semibold text-blue-950">
            {image.label}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

function CartMeta({ label, value }: CartMetaProps) {
  return (
    <div className="rounded-[0.95rem] border border-blue-100 bg-blue-50 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-blue-950">{value}</p>
    </div>
  )
}

function formatQuantities(entries: [string, number | undefined][]) {
  if (entries.length === 0) {
    return 'Aucune'
  }

  return entries.map(([size, quantity]) => `${size}: ${quantity}`).join(', ')
}
