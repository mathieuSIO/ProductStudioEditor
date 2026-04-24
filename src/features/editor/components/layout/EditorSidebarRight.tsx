import { PanelCard } from '../../../../components/ui/PanelCard'
import type {
  Product,
  ProductColor,
  ProductViewId,
} from '../../types'
import { PriceSummaryPanel } from '../panels/PriceSummaryPanel'

type EditorSidebarRightProps = {
  activeView: ProductViewId
  addToCartFeedbackMessage: string | null
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
  canAddToCart,
  grandTotal,
  onAddToCart,
  product,
  productColor,
  totalQuantity,
}: EditorSidebarRightProps) {
  return (
    <aside className="flex flex-col gap-2.5">
      <PanelCard
        title="Resumé"
        aside={
          <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            Edition
          </span>
        }
      >
        {activeView === 'custom' && (
          <div className="rounded-[1rem] border border-stone-200 bg-stone-50/80 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                Mode actif
              </p>
              <span className="rounded-full border border-stone-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                Autre
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-5 text-stone-500">
              La demande personnalisee se renseigne maintenant directement dans le studio central pour rester au coeur de l'ecran.
            </p>
            <div className="mt-2.5 rounded-[0.95rem] border border-stone-200 bg-white px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                Usage
              </p>
              <p className="mt-1 text-sm leading-5 text-stone-600">
                Utilise ce mode pour decrire une manche, une nuque, un bas de dos ou toute autre zone specifique.
              </p>
            </div>
          </div>
        )}

        <div className="rounded-[1rem] border border-stone-200 bg-stone-50/70 p-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
              Contexte produit
            </p>
            <span className="rounded-full border border-stone-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              Vue {getViewLabel(activeView)}
            </span>
          </div>

          <div className="mt-2 grid gap-1.5">
            <ContextRow label="Produit" value={product.name} />
            <ContextRow label="Couleur" value={productColor.label} />
          </div>
        </div>

        <PriceSummaryPanel
          addToCartFeedbackMessage={addToCartFeedbackMessage}
          canAddToCart={canAddToCart}
          grandTotal={grandTotal}
          onAddToCart={onAddToCart}
          product={product}
          productColor={productColor}
          totalQuantity={totalQuantity}
        />
      </PanelCard>
    </aside>
  )
}

type ContextRowProps = {
  label: string
  value: string
}

function ContextRow({ label, value }: ContextRowProps) {
  return (
    <div className="rounded-[0.9rem] border border-stone-200 bg-white px-2.5 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-stone-800">{value}</p>
    </div>
  )
}

function getViewLabel(view: ProductViewId) {
  switch (view) {
    case 'front':
      return 'avant'
    case 'back':
      return 'arriere'
    case 'custom':
      return 'autre'
    default:
      return view
  }
}
