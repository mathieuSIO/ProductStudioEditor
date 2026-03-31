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
    <aside className="flex flex-col gap-3">
      <PanelCard
        eyebrow="Panneau droit"
        title="Panneau d'edition"
        description="Cette colonne regroupe le contexte produit et les proprietes du logo selectionne."
        aside={
          <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            Edition
          </span>
        }
      >
        <div className="rounded-[1.15rem] border border-stone-200 bg-stone-50/80 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
            Contexte produit
          </p>
          <div className="mt-3 grid gap-2">
            <ContextRow label="Produit" value={product.name} />
            <ContextRow label="Couleur" value={productColor.label} />
            <ContextRow
              label="Zone imprimable"
              value={`${productView.printableArea.width}% x ${productView.printableArea.height}%`}
            />
          </div>
        </div>

        <LogoControlsPanel
          controls={logoControls}
          onChange={onLogoControlsChange}
        />

        <LogoInspectorPanel
          activeView={activeView}
          logoElement={logoElement}
          product={product}
          productView={productView}
          selectedElementId={selectedElementId}
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
    <div className="rounded-[0.95rem] border border-stone-200 bg-white px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-medium text-stone-800">{value}</p>
    </div>
  )
}
