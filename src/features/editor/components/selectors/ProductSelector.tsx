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
  const selectId = useId()

  return (
    <div className="rounded-[0.95rem] border border-blue-100 bg-white px-3 py-2.5">
      <label
        htmlFor={selectId}
        className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700"
      >
        Type de produit
      </label>
      <p className="mt-1 text-sm leading-5 text-stone-500">
        Choisissez le support qui recevra votre marquage.
      </p>

      <div className="mt-2.5">
        <select
          id={selectId}
          value={selectedProductId}
          onChange={(event) => onSelect(event.target.value as Product['id'])}
          className="w-full appearance-none rounded-[0.9rem] border border-blue-100 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-950 outline-none transition-colors hover:border-blue-200 focus:border-red-500 focus:bg-white"
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
