import { PanelCard } from '../../../components/ui/PanelCard'
import type {
  DesignElement,
  EditorElementId,
  Product,
  ProductColor,
  ProductView,
  ProductViewId,
} from '../types'
import { ProductMockupPreview } from './ProductMockupPreview'

type EditorCanvasAreaProps = {
  logoElement: DesignElement | null
  onLogoPositionChange: (position: DesignElement['position']) => void
  onLogoSizeChange: (size: DesignElement['size']) => void
  selectedElementId: EditorElementId | null
  onElementSelect: (elementId: EditorElementId | null) => void
  product: Product
  productColor: ProductColor
  productView: ProductView
  activeView: ProductViewId
  availableViews: ProductViewId[]
  onViewSelect: (view: ProductViewId) => void
}

export function EditorCanvasArea({
  logoElement,
  onLogoPositionChange,
  onLogoSizeChange,
  selectedElementId,
  onElementSelect,
  product,
  productColor,
  productView,
  activeView,
  availableViews,
  onViewSelect,
}: EditorCanvasAreaProps) {
  return (
    <section className="flex min-h-[420px] flex-col xl:min-h-[760px]">
      <PanelCard
        title="Preview du configurateur"
        description="Surface principale du studio, concentree sur la zone d'impression et l'element actif."
        aside={
          <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            Priorite visuelle
          </span>
        }
        className="flex h-full flex-1 flex-col"
      >
        <div className="flex flex-1 flex-col gap-3 sm:gap-4">
          <div className="relative flex min-h-[400px] flex-1 items-center justify-center overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-[linear-gradient(180deg,rgba(252,252,251,0.98),rgba(244,244,243,0.98))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_28px_70px_-46px_rgba(120,113,108,0.35)] sm:min-h-[520px] sm:p-4 xl:min-h-[700px] xl:p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_transparent_38%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(255,255,255,0.85),_transparent_26%)]" />
            <div className="absolute inset-2.5 rounded-[1.45rem] border border-white/85 bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(255,255,255,0.22))] sm:inset-4" />
            <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(231,229,228,0.32)_1px,transparent_1px),linear-gradient(90deg,rgba(231,229,228,0.22)_1px,transparent_1px)] [background-size:26px_26px]" />
            <div className="absolute left-1/2 top-8 h-44 w-44 -translate-x-1/2 rounded-full bg-amber-100/35 blur-3xl sm:h-64 sm:w-64" />
            <div className="absolute inset-x-8 bottom-0 h-24 bg-[radial-gradient(circle_at_center,_rgba(214,211,209,0.38),_transparent_72%)]" />

            <div className="relative z-10 flex h-full w-full max-w-none flex-col items-center gap-3 px-0.5 sm:gap-4 sm:px-2 xl:gap-4">
              <div className="flex w-full flex-1 items-center">
                <div className="w-full rounded-[1.7rem] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,248,247,0.96))] px-2 py-3 shadow-[0_26px_70px_-42px_rgba(120,113,108,0.34)] sm:px-4 sm:py-4 xl:px-5 xl:py-5">
                  <ProductMockupPreview
                    logoElement={logoElement}
                    onLogoPositionChange={onLogoPositionChange}
                    onLogoSizeChange={onLogoSizeChange}
                    selectedElementId={selectedElementId}
                    onElementSelect={onElementSelect}
                    productName={product.name}
                    productColorLabel={productColor.label}
                    productView={productView}
                    activeView={activeView}
                  />
                </div>
              </div>

              <div className="w-full max-w-5xl">
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {availableViews.map((view) => {
                    const isActive = view === activeView
                    const viewConfig = productColor.views[view]

                    if (!viewConfig) {
                      return null
                    }

                    return (
                      <button
                        key={view}
                        type="button"
                        onClick={() => onViewSelect(view)}
                        aria-pressed={isActive}
                        className={`rounded-[1.15rem] border p-2 text-left transition-all ${
                          isActive
                            ? 'border-stone-900 bg-stone-900 text-white shadow-[0_18px_35px_-24px_rgba(28,25,23,0.45)]'
                            : 'border-stone-200 bg-white/92 text-stone-700 hover:border-stone-300'
                        }`}
                      >
                        <div
                          className={`relative flex h-20 items-center justify-center overflow-hidden rounded-[0.95rem] ${
                            isActive
                              ? 'bg-white/10'
                              : 'bg-[linear-gradient(180deg,rgba(250,250,249,0.95),rgba(241,240,239,0.92))]'
                          }`}
                        >
                          {viewConfig.asset.kind === 'image' ? (
                            <img
                              src={viewConfig.asset.src}
                              alt={viewConfig.asset.alt}
                              className="pointer-events-none h-full w-full object-contain"
                              draggable={false}
                            />
                          ) : (
                            <div className="pointer-events-none flex h-full w-full items-center justify-center">
                              <div
                                className={`shadow-[0_18px_26px_-20px_rgba(120,113,108,0.48)] ${getThumbnailMockupClasses(
                                  viewConfig.mockup,
                                  view,
                                )}`}
                                style={{ backgroundColor: productColor.swatchHex }}
                              />
                            </div>
                          )}

                          <div className="absolute inset-x-4 bottom-2 h-3 rounded-full bg-stone-300/30 blur-md" />
                        </div>

                        <div className="mt-2 px-1">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em]">
                            Vue {getViewLabel(view)}
                          </p>
                          <p
                            className={`mt-0.5 text-[11px] ${
                              isActive ? 'text-white/75' : 'text-stone-500'
                            }`}
                          >
                            {viewConfig.asset.kind === 'image'
                              ? 'Mockup reel'
                              : 'Apercu simplifie'}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PanelCard>
    </section>
  )
}

function getThumbnailMockupClasses(
  mockup: ProductView['mockup'],
  view: ProductViewId,
) {
  switch (mockup) {
    case 'cap':
      return view === 'front' || view === 'back'
        ? 'h-10 w-16 rounded-[50%_50%_38%_38%/70%_70%_34%_34%] border border-black/10'
        : 'h-9 w-14 rounded-[48%_48%_40%_40%/62%_62%_34%_34%] border border-black/10'
    case 'generic':
      return 'h-16 w-12 rounded-[1rem] border border-black/10'
    case 'polo':
      return view === 'front' || view === 'back'
        ? 'h-16 w-12 rounded-[1.2rem] border border-black/10'
        : 'h-16 w-8 rounded-[0.9rem] border border-black/10'
    case 'sweatshirt':
      return view === 'front' || view === 'back'
        ? 'h-16 w-14 rounded-[1.35rem] border border-black/10'
        : 'h-16 w-8 rounded-[1rem] border border-black/10'
    case 'tshirt':
      return view === 'front' || view === 'back'
        ? 'h-16 w-12 rounded-[1.15rem] border border-black/10'
        : 'h-16 w-8 rounded-[0.95rem] border border-black/10'
    default:
      return 'h-16 w-12 rounded-[1rem] border border-black/10'
  }
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
      return 'droite'
    case 'detail':
      return 'detail'
    default:
      return view
  }
}
