import { Link } from 'react-router-dom'

import { formatEuro } from '../../../shared/formatters/formatEuro'
import type { ShopProduct } from '../types/shop.types'
import { ShopProductImage } from './ShopProductImage'

type ShopProductCardProps = {
  product: ShopProduct
}

export function ShopProductCard({ product }: ShopProductCardProps) {
  return (
    <article className="flex h-full flex-col rounded-[1.15rem] border border-stone-200 bg-white p-3 shadow-[0_18px_42px_-38px_rgba(15,23,42,0.35)]">
      <ShopProductImage imageUrl={product.imageUrl} name={product.name} />
      <div className="flex flex-1 flex-col px-1 pb-1 pt-4 whitespace-pre-line">
        <h2 className="text-lg font-semibold tracking-tight text-blue-950">
          {product.name}
        </h2>
        {product.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600 whitespace-pre-line">
            {product.description}
          </p>
        ) : null}
        <p className="mt-3 text-xl font-semibold tracking-tight text-red-600">
          {formatEuro(product.priceCents / 100)}
        </p>
        <Link
          className="mt-auto inline-flex min-h-11 items-center justify-center rounded-[1rem] bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          to={`/boutique/${product.slug}`}
        >
          Voir le produit
        </Link>
      </div>
    </article>
  )
}
