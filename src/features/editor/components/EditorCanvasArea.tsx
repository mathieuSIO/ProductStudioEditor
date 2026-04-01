import type { RefObject } from 'react'

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
  selectionSafeAreaRef: RefObject<HTMLDivElement | null>
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
  selectionSafeAreaRef,
}: EditorCanvasAreaProps) {
  return (
    <section className="flex min-h-[420px] flex-col xl:min-h-[760px]">
      <PanelCard
        title="Studio produit"
        description="Zone principale de personnalisation, centree sur la vue active et le visuel."
        aside={
          <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            Studio
          </span>
        }
        className="flex h-full flex-1 flex-col"
      >
        <div className="flex flex-1 flex-col gap-2.5 sm:gap-3">
          <div className="relative flex min-h-[400px] flex-1 items-center justify-center overflow-hidden rounded-[1.55rem] border border-stone-200/80 bg-[linear-gradient(180deg,rgba(252,252,251,0.98),rgba(245,245,244,0.98))] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_24px_55px_-44px_rgba(120,113,108,0.32)] sm:min-h-[520px] sm:p-3 xl:min-h-[700px] xl:p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.92),_transparent_42%)]" />
            <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(231,229,228,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(231,229,228,0.18)_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="absolute inset-2 rounded-[1.3rem] border border-white/85 bg-[linear-gradient(135deg,rgba(255,255,255,0.7),rgba(255,255,255,0.18))] sm:inset-3" />
            <div className="absolute left-1/2 top-7 h-36 w-36 -translate-x-1/2 rounded-full bg-amber-100/25 blur-3xl sm:h-52 sm:w-52" />
            <div className="absolute inset-x-10 bottom-1 h-20 bg-[radial-gradient(circle_at_center,_rgba(214,211,209,0.26),_transparent_72%)]" />

            <div className="relative z-10 flex h-full w-full max-w-none flex-col items-center gap-2.5 px-0.5 sm:gap-3 sm:px-1.5 xl:gap-3">
              <div className="flex w-full flex-1 items-center">
                <div className="w-full rounded-[1.45rem] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,248,247,0.96))] px-1.5 py-2.5 shadow-[0_24px_56px_-42px_rgba(120,113,108,0.28)] sm:px-3 sm:py-3.5 xl:px-4 xl:py-4">
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
                    selectionSafeAreaRef={selectionSafeAreaRef}
                  />
                </div>
              </div>

              <div className="w-full">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-4">
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
                        className={`rounded-[1rem] border px-2 py-2 text-left transition-all ${
                          isActive
                            ? 'border-stone-900 bg-stone-900 text-white shadow-[0_16px_28px_-22px_rgba(28,25,23,0.55)]'
                            : 'border-stone-200 bg-white/92 text-stone-700 hover:border-stone-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`relative flex h-12 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[0.85rem] border ${
                              isActive
                                ? 'border-white/15 bg-white/10'
                                : 'border-stone-200 bg-[linear-gradient(180deg,rgba(250,250,249,0.95),rgba(241,240,239,0.92))]'
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
                                  className={`shadow-[0_14px_20px_-18px_rgba(120,113,108,0.48)] ${getThumbnailMockupClasses(
                                    viewConfig.mockup,
                                    view,
                                  )}`}
                                  style={{ backgroundColor: productColor.swatchHex }}
                                />
                              </div>
                            )}

                            <div className="absolute inset-x-2 bottom-1.5 h-2 rounded-full bg-stone-300/25 blur-sm" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                              {getViewLabel(view)}
                            </p>
                            <p
                              className={`mt-0.5 text-[11px] ${
                                isActive ? 'text-white/72' : 'text-stone-500'
                              }`}
                            >
                              {isActive ? 'Vue active' : 'Basculer'}
                            </p>
                          </div>
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
      return 'h-10 w-7 rounded-[0.8rem] border border-black/10'
    case 'polo':
      return view === 'front' || view === 'back'
        ? 'h-10 w-7 rounded-[0.8rem] border border-black/10'
        : 'h-10 w-5 rounded-[0.7rem] border border-black/10'
    case 'sweatshirt':
      return view === 'front' || view === 'back'
        ? 'h-10 w-9 rounded-[0.9rem] border border-black/10'
        : 'h-10 w-5 rounded-[0.75rem] border border-black/10'
    case 'tshirt':
      return view === 'front' || view === 'back'
        ? 'h-10 w-7 rounded-[0.82rem] border border-black/10'
        : 'h-10 w-5 rounded-[0.72rem] border border-black/10'
    default:
      return 'h-10 w-7 rounded-[0.8rem] border border-black/10'
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
