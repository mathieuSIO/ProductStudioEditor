import { resolveShopProductImageUrl } from '../api/shopProductsApi'

type ShopProductImageProps = {
  imageUrl: string | null
  name: string
  variant?: 'card' | 'detail'
}

export function ShopProductImage({
  imageUrl,
  name,
  variant = 'card',
}: ShopProductImageProps) {
  const resolvedImageUrl = resolveShopProductImageUrl(imageUrl)
  const className =
    variant === 'detail'
      ? 'aspect-[4/3] rounded-[1.35rem]'
      : 'aspect-[4/3] rounded-[1rem]'
  const imageFitClass =
    variant === 'detail' ? 'bg-stone-50 object-contain' : 'object-cover'

  if (!resolvedImageUrl) {
    return (
      <div
        className={`flex w-full items-center justify-center border border-stone-200 bg-stone-50 px-6 text-center ${className}`}
      >
        <span className="text-sm font-semibold text-stone-400">
          Image produit a venir
        </span>
      </div>
    )
  }

  return (
    <img
      alt={name}
      className={`w-full border border-stone-200 ${imageFitClass} ${className}`}
      src={resolvedImageUrl}
    />
  )
}
