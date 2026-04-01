import { PanelCard } from '../../../components/ui/PanelCard'
import type {
  DesignElement,
  EditorElementId,
  LogoManualControls,
  Product,
  ProductColor,
  ProductView,
  ProductViewId,
} from '../types'
import { LogoControlsPanel } from './LogoControlsPanel'
import { LogoInspectorPanel } from './LogoInspectorPanel'

type EditorSidebarRightProps = {
  activeView: ProductViewId
  logoElement: DesignElement | null
  logoControls: LogoManualControls | null
  onLogoControlsChange: (controls: LogoManualControls) => void
  product: Product
  productColor: ProductColor
  productView: ProductView
  selectedElementId: EditorElementId | null
}

export function EditorSidebarRight({
  activeView,
  logoElement,
  logoControls,
  onLogoControlsChange,
  product,
  productColor,
  productView,
  selectedElementId,
}: EditorSidebarRightProps) {
  return (
    <aside className="flex flex-col gap-2.5">
      <PanelCard
        eyebrow="Panneau droit"
        title="Inspector"
        description="Reglages du logo selectionne et contexte de la vue active."
        aside={
          <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            Edition
          </span>
        }
      >
        <LogoControlsPanel
          controls={logoControls}
          logoAspectRatio={
            logoElement && logoElement.size.height > 0
              ? logoElement.size.width / logoElement.size.height
              : 1
          }
          onChange={onLogoControlsChange}
        />

        <LogoInspectorPanel
          activeView={activeView}
          logoElement={logoElement}
          product={product}
          productView={productView}
          selectedElementId={selectedElementId}
        />

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
            <ContextRow
              label="Zone"
              value={`${productView.printableArea.width}% x ${productView.printableArea.height}%`}
            />
          </div>
        </div>
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
    case 'detail':
      return 'detail'
    default:
      return view
  }
}
