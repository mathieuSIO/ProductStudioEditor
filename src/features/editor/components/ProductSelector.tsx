import { useId } from 'react'

import type { Product, ProductMockup } from '../types'

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
  const selectedProduct = products.find(
    (product) => product.id === selectedProductId,
  )
  const primaryColor = selectedProduct?.colors[0]
  const primaryView =
    primaryColor?.views.front ?? Object.values(primaryColor?.views ?? {})[0]

  return (
    <div className="rounded-[1.1rem] border border-stone-200 bg-white px-3 py-2.5">
      <label
        htmlFor={selectId}
        className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400"
      >
        Produit
      </label>
      <p className="mt-1.5 text-sm leading-5 text-stone-500">
        Choisis le support a personnaliser dans la preview centrale.
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

      {selectedProduct ? (
        <div className="mt-2.5 rounded-[0.95rem] border border-stone-200 bg-stone-50/80 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
            Produit actif
          </p>
          <p className="mt-1.5 text-sm font-medium text-stone-800">
            {selectedProduct.name}
          </p>
          <p className="mt-1 text-sm leading-5 text-stone-500">
            {getCategoryLabel(selectedProduct.category)} • Mockup{' '}
            {getMockupLabel(primaryView?.mockup ?? 'generic').toLowerCase()}
          </p>
        </div>
      ) : null}
    </div>
  )
}

function getCategoryLabel(category: Product['category']) {
  switch (category) {
    case 'headwear':
      return 'Accessoire textile'
    case 'top':
      return 'Haut textile'
    case 'other':
      return 'Support generique'
    default:
      return category
  }
}

function getMockupLabel(mockup: ProductMockup) {
  switch (mockup) {
    case 'cap':
      return 'casquette'
    case 'generic':
      return 'generique'
    case 'polo':
      return 'polo'
    case 'sweatshirt':
      return 'pull'
    case 'tshirt':
      return 't-shirt'
    default:
      return 'produit'
  }
}
