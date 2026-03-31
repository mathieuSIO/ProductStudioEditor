import type {
  DesignElement,
  EditorElementId,
  Product,
  ProductView,
  ProductViewId,
} from '../types'

type LogoInspectorPanelProps = {
  activeView: ProductViewId
  logoElement: DesignElement | null
  product: Product
  productView: ProductView
  selectedElementId: EditorElementId | null
}

export function LogoInspectorPanel({
  activeView,
  logoElement,
  product,
  productView,
  selectedElementId,
}: LogoInspectorPanelProps) {
  const hasActiveLogoSelection =
    selectedElementId === logoElement?.id && Boolean(logoElement)

  return (
    <div className="rounded-[1.15rem] border border-stone-200 bg-stone-50/80 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
        Inspection
      </p>

      <div className="mt-3 grid gap-2">
        <InspectorTile
          label="Element actif"
          title={
            hasActiveLogoSelection
              ? 'Logo selectionne'
              : 'Aucun element selectionne'
          }
          description={
            hasActiveLogoSelection
              ? 'Le logo importe peut etre ajuste depuis les proprietes au-dessus.'
              : logoElement
                ? 'Le logo est visible dans la scene. Clique dessus pour afficher ses guides et ses proprietes.'
                : "Importe d'abord un logo depuis le panneau gauche pour commencer la personnalisation."
          }
        />

        <InspectorTile
          label="Contexte produit"
          title={product.name}
          description={`Vue ${getViewLabel(activeView)} • ${productView.printableArea.width}% x ${productView.printableArea.height}%`}
        />

        <InspectorTile
          label="Fichier actif"
          title={
            hasActiveLogoSelection && logoElement
              ? logoElement.asset.name
              : 'Aucun fichier actif'
          }
          description={
            hasActiveLogoSelection && logoElement
              ? logoElement.asset.mimeType
              : 'Selectionne le logo dans la scene pour afficher son fichier.'
          }
        />
      </div>
    </div>
  )
}

type InspectorTileProps = {
  description: string
  label: string
  title: string
}

function InspectorTile({ description, label, title }: InspectorTileProps) {
  return (
    <div className="rounded-[0.95rem] border border-stone-200 bg-white px-3 py-2.5 shadow-[0_14px_30px_-24px_rgba(120,113,108,0.16)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-medium text-stone-800">{title}</p>
      <p className="mt-1 text-sm leading-5 text-stone-500">{description}</p>
    </div>
  )
}

function getViewLabel(view: ProductViewId) {
  switch (view) {
    case 'front':
      return 'avant'
    case 'back':
      return 'arriere'
    // case 'left':
    //   return 'gauche'
    // case 'right':
    //   return 'droite'
    case 'detail':
      return 'detail'
    default:
      return view
  }
}
