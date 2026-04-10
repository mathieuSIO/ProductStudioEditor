import { useId } from 'react'

import type { Product } from '../../types'

type ProductSelectorProps = {
  onSelect: (productId: Product['id']) => void
  products: Product[]
  selectedProductId: Product['id']
}

export function ProductSelector({
  onSelect,
  products,
  selectedProductId,
}: ProductSelectorProps) {
  const selectId = useId();

  return (
    <div className="rounded-[1.1rem] border border-stone-200 bg-white px-3 py-2.5">
      <label
        htmlFor={selectId}
        className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400"
      >
        Produit
      </label>
      <p className="mt-1.5 text-sm leading-5 text-stone-500">
        Choisissez votre produit à personnaliser.
      </p>

      <div className="mt-2.5">
        <select
          id={selectId}
          value={selectedProductId}
          onChange={(event) => onSelect(event.target.value as Product['id'])}
          className="w-full appearance-none rounded-[0.95rem] border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm font-medium text-stone-800 outline-none transition-colors hover:border-stone-300 focus:border-stone-900"
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

