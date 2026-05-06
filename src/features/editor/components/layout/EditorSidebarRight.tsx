import type { Product, ProductColor, ProductViewId } from '../../types'
import { PriceSummaryPanel } from '../panels/PriceSummaryPanel'

type EditorSidebarRightProps = {
  activeView: ProductViewId
  addToCartFeedbackMessage: string | null
  addToCartDisabledMessage: string | null
  canAddToCart: boolean
  grandTotal: number
  onAddToCart?: () => void
  printTotal: number
  product: Product
  productColor: ProductColor
  textileTotal: number
  totalQuantity: number
}

export function EditorSidebarRight({
  activeView,
  addToCartFeedbackMessage,
  addToCartDisabledMessage,
  canAddToCart,
  grandTotal,
  onAddToCart,
  product,
  productColor,
  totalQuantity,
}: EditorSidebarRightProps) {
  return (
    <aside className="flex flex-col gap-3">
      {activeView === 'custom' ? (
        <div className="rounded-[1.15rem] border border-blue-100 bg-blue-50 px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
              Mode actif
            </p>
            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-600">
              Autre
            </span>
          </div>
          <p className="mt-2 text-sm leading-5 text-blue-900">
            Décrivez une manche, une nuque, un bas de dos ou toute autre zone
            spécifique dans l’aperçu central.
          </p>
        </div>
      ) : null}

      <PriceSummaryPanel
        addToCartFeedbackMessage={addToCartFeedbackMessage}
        addToCartDisabledMessage={addToCartDisabledMessage}
        canAddToCart={canAddToCart}
        grandTotal={grandTotal}
        onAddToCart={onAddToCart}
        product={product}
        productColor={productColor}
        totalQuantity={totalQuantity}
      />
    </aside>
  )
}
