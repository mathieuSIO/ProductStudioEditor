import type { RefObject } from 'react'

import type {
  DesignElement,
  EditorElementId,
  Product,
  ProductColor,
  ProductView,
  ProductViewId,
} from '../../types'
import { ProductMockupPreview } from '../canvas/ProductMockupPreview'
import { CustomPlacementCard } from '../panels/CustomPlacementCard'

type EditorCanvasAreaProps = {
  logoElements: DesignElement[]
  onLogoPositionChange: (position: DesignElement['position']) => void
  onLogoSizeChange: (size: DesignElement['size']) => void
  selectedElementId: EditorElementId | null
  onElementSelect: (elementId: EditorElementId | null) => void
  product: Product
  productColor: ProductColor
  productView: ProductView | null
  activeView: ProductViewId
  availableViews: ProductViewId[]
  customPlacement: string
  onCustomPlacementChange: (value: string) => void
  onViewSelect: (view: ProductViewId) => void
  selectionSafeAreaRef: RefObject<HTMLDivElement | null>
}

export function EditorCanvasArea({
  logoElements,
  onLogoPositionChange,
  onLogoSizeChange,
  selectedElementId,
  onElementSelect,
  product,
  productColor,
  productView,
  activeView,
  availableViews,
  customPlacement,
  onCustomPlacementChange,
  onViewSelect,
  selectionSafeAreaRef,
}: EditorCanvasAreaProps) {
  return (
    <section className="flex min-h-[420px] flex-col xl:min-h-[760px]">
      <div className="flex h-full flex-1 flex-col overflow-hidden rounded-[1.35rem] border border-blue-100 bg-white shadow-[0_18px_42px_-34px_rgba(15,23,42,0.45)]">
        <header className="flex flex-col gap-3 border-b border-blue-100 bg-white px-3.5 py-3.5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-600">
              Aperçu produit
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-blue-950">
              Aperçu de votre personnalisation
            </h2>
            <p className="mt-1 text-sm leading-5 text-stone-500">
              Déplacez votre logo, ajustez sa taille et visualisez le rendu en direct.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-950">
              Vue {getViewLabel(activeView)}
            </span>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-2.5 p-2.5 sm:gap-3 sm:p-3">
          <div className="relative flex min-h-[400px] flex-1 items-center justify-center overflow-hidden rounded-[1.55rem] border border-blue-100 bg-[linear-gradient(180deg,rgba(239,246,255,0.95),rgba(255,255,255,0.98)_48%,rgba(254,242,242,0.65))] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_28px_70px_-50px_rgba(15,23,42,0.45)] sm:min-h-[520px] sm:p-3 xl:min-h-[700px] xl:p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.92),_transparent_45%)]" />
            <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(30,64,175,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(30,64,175,0.06)_1px,transparent_1px)] [background-size:30px_30px]" />
            <div className="absolute inset-2 rounded-[1.3rem] border border-white/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.75),rgba(255,255,255,0.18))] sm:inset-3" />
            <div className="absolute left-1/2 top-8 h-40 w-40 -translate-x-1/2 rounded-full bg-blue-200/30 blur-3xl sm:h-56 sm:w-56" />
            <div className="absolute right-8 top-10 h-28 w-28 rounded-full bg-red-200/25 blur-3xl" />
            <div className="absolute inset-x-10 bottom-1 h-20 bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.16),_transparent_72%)]" />

            <div className="absolute left-3 right-3 top-3 z-20 rounded-[0.9rem] border border-blue-100 bg-white/90 px-3 py-1.5 text-center text-[11px] font-semibold text-blue-950 shadow-sm sm:left-4 sm:right-auto sm:top-4 sm:rounded-full sm:text-left">
              Zone imprimable visible lors de la sélection du logo
            </div>

            <div className="relative z-10 flex h-full w-full max-w-none flex-col items-center gap-2.5 px-0.5 sm:gap-3 sm:px-1.5 xl:gap-3">
              <div className="flex w-full flex-1 items-center">
                <div className="w-full rounded-[1.45rem] border border-white/95 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.96))] px-1.5 py-2.5 shadow-[0_28px_68px_-46px_rgba(15,23,42,0.38)] ring-1 ring-blue-100/70 sm:px-3 sm:py-3.5 xl:px-4 xl:py-4">
                  {activeView === 'custom' || !productView ? (
                    <CustomPlacementCard
                      productName={product.name}
                      value={customPlacement}
                      onChange={onCustomPlacementChange}
                    />
                  ) : (
                    <ProductMockupPreview
                      logoElements={logoElements}
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
                  )}
                </div>
              </div>

              <EditorViewSelector
                activeView={activeView}
                availableViews={availableViews}
                productColor={productColor}
                onViewSelect={onViewSelect}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

type EditorViewSelectorProps = {
  activeView: ProductViewId
  availableViews: ProductViewId[]
  productColor: ProductColor
  onViewSelect: (view: ProductViewId) => void
}

function EditorViewSelector({
  activeView,
  availableViews,
  productColor,
  onViewSelect,
}: EditorViewSelectorProps) {
  return (
    <div className="w-full rounded-[1.05rem] border border-blue-100 bg-white/92 p-2 shadow-[0_16px_30px_-28px_rgba(15,23,42,0.35)]">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
          Choisir la vue
        </p>
        <p className="text-xs font-medium text-stone-500">
          {getViewLabel(activeView)} actif
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {availableViews.map((view) => {
          const isActive = view === activeView
          const viewConfig = view === 'custom' ? null : productColor.views[view]

          if (view !== 'custom' && !viewConfig) {
            return null
          }

          const resolvedViewConfig = view === 'custom' ? null : viewConfig

          return (
            <button
              key={view}
              type="button"
              onClick={() => onViewSelect(view)}
              aria-pressed={isActive}
              className={`rounded-[1rem] border px-2.5 py-2 text-left transition-all ${
                isActive
                  ? 'border-blue-950 bg-blue-950 text-white shadow-[0_16px_28px_-22px_rgba(15,23,42,0.65)]'
                  : 'border-blue-100 bg-blue-50/80 text-blue-950 hover:border-red-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:flex-col sm:items-start xl:flex-row xl:items-center">
                <div
                  className={`relative flex h-11 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[0.85rem] border sm:h-10 sm:w-full xl:h-12 xl:w-14 ${
                    isActive
                      ? 'border-white/15 bg-white/10'
                      : 'border-stone-200 bg-[linear-gradient(180deg,rgba(250,250,249,0.95),rgba(241,240,239,0.92))]'
                  }`}
                >
                  {view === 'custom' ? (
                    <div className="pointer-events-none flex h-full w-full items-center justify-center">
                      <span
                        className={`text-lg font-semibold ${
                          isActive ? 'text-white' : 'text-stone-600'
                        }`}
                      >
                        ?
                      </span>
                    </div>
                  ) : resolvedViewConfig?.asset.kind === 'image' ? (
                    <img
                      src={resolvedViewConfig.asset.src}
                      alt={resolvedViewConfig.asset.alt}
                      className="pointer-events-none h-full w-full object-contain"
                      draggable={false}
                    />
                  ) : (
                    <div className="pointer-events-none flex h-full w-full items-center justify-center">
                      <div
                        className={`shadow-[0_14px_20px_-18px_rgba(120,113,108,0.48)] ${getThumbnailMockupClasses(
                          resolvedViewConfig!.mockup,
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
                    {view === 'custom'
                      ? isActive
                      ? 'Demande active'
                      : 'Décrire'
                      : isActive
                        ? 'Vue active'
                        : 'Voir cette face'}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
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
      return 'Avant'
    case 'back':
      return 'Arrière'
    case 'custom':
      return 'Autre'
    default:
      return view
  }
}
