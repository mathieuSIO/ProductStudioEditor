import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

import type {
  DesignElement,
  EditorElementId,
  Product,
  ProductMockup,
  ProductView,
  ProductViewId,
} from '../types'
import { LogoPreviewLayer } from './LogoPreviewLayer'
import { PrintableAreaOverlay } from './PrintableAreaOverlay'

type ProductMockupPreviewProps = {
  logoElement: DesignElement | null
  onLogoPositionChange: (position: DesignElement['position']) => void
  onLogoSizeChange: (size: DesignElement['size']) => void
  selectedElementId: EditorElementId | null
  onElementSelect: (elementId: EditorElementId | null) => void
  productName: Product['name']
  productColorLabel: string
  productView: ProductView
  activeView: ProductViewId
  selectionSafeAreaRef: RefObject<HTMLDivElement | null>
}

export function ProductMockupPreview({
  logoElement,
  onLogoPositionChange,
  onLogoSizeChange,
  selectedElementId,
  onElementSelect,
  productName,
  productColorLabel,
  productView,
  activeView,
  selectionSafeAreaRef,
}: ProductMockupPreviewProps) {
  const logoLayerRef = useRef<HTMLDivElement | null>(null)
  const realMockupAsset =
    productView.asset.kind === 'image' ? productView.asset : null
  const fallbackMockupAsset =
    productView.asset.kind === 'fallback' ? productView.asset : null
  const isLogoSelected = selectedElementId === 'logo'

  useEffect(() => {
    if (!isLogoSelected) {
      return
    }

    function handleDocumentPointerDown(event: PointerEvent) {
      if (!logoLayerRef.current) {
        return
      }

      const eventTarget = event.target

      if (
        eventTarget instanceof Node &&
        isWithinSelectionSafeArea(
          eventTarget,
          logoLayerRef.current,
          selectionSafeAreaRef.current,
        )
      ) {
        return
      }

      onElementSelect(null)
    }

    document.addEventListener('pointerdown', handleDocumentPointerDown, true)

    return () => {
      document.removeEventListener(
        'pointerdown',
        handleDocumentPointerDown,
        true,
      )
    }
  }, [isLogoSelected, onElementSelect, selectionSafeAreaRef])

  return (
    <div className="mx-auto flex min-h-[18rem] w-full max-w-[28rem] items-center justify-center sm:min-h-[20rem] sm:max-w-[34rem] lg:max-w-[40rem] xl:max-w-[46rem] 2xl:max-w-[50rem]">
      <div className={getStageClasses(productView.mockup, Boolean(realMockupAsset))}>
        <div className="pointer-events-none absolute inset-x-[10%] bottom-[4%] h-[12%] rounded-full bg-stone-300/50 blur-2xl" />
        <div className="pointer-events-none absolute inset-x-[16%] bottom-[2%] h-[7%] rounded-full bg-stone-400/28 blur-xl" />
        <div className="pointer-events-none absolute inset-x-[12%] inset-y-[10%] rounded-[2.2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0.05))]" />
        <div className="pointer-events-none absolute left-1/2 top-[12%] h-[28%] w-[42%] -translate-x-1/2 rounded-full bg-white/35 blur-3xl" />

        {realMockupAsset ? (
          <div className={getImageMockupFrameClasses(productView.mockup)}>
            <img
              src={realMockupAsset.src}
              alt={realMockupAsset.alt}
              className="pointer-events-none relative z-0 h-full w-full object-contain drop-shadow-[0_34px_38px_rgba(120,113,108,0.28)]"
              draggable={false}
            />

            <div className="absolute inset-0 z-20">
              <div ref={logoLayerRef} className="absolute inset-0 z-30">
                <LogoPreviewLayer
                  area={productView.printableArea}
                  isSelected={isLogoSelected}
                  element={logoElement}
                  onPositionChange={onLogoPositionChange}
                  onSizeChange={onLogoSizeChange}
                  onSelect={() => onElementSelect('logo')}
                />
              </div>

              {isLogoSelected ? (
                <div className="pointer-events-none absolute inset-0 z-20">
                  <PrintableAreaOverlay area={productView.printableArea} />
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className={getFallbackMockupClasses(productView.mockup, activeView)}>
            <div ref={logoLayerRef} className="absolute inset-0 z-30">
              <LogoPreviewLayer
                area={productView.printableArea}
                isSelected={isLogoSelected}
                element={logoElement}
                onPositionChange={onLogoPositionChange}
                onSizeChange={onLogoSizeChange}
                onSelect={() => onElementSelect('logo')}
              />
            </div>

            {isLogoSelected ? (
              <div className="pointer-events-none absolute inset-0 z-20">
                <PrintableAreaOverlay area={productView.printableArea} />
              </div>
            ) : null}

            {renderMockupDetails(productView.mockup, activeView)}

            {activeView === 'front' ? (
              <>
                <div className="pointer-events-none absolute inset-x-[14%] top-[12%] h-[10%] rounded-t-[1.25rem] bg-white/82 blur-[1px]" />
                <div className="pointer-events-none absolute inset-x-[18%] bottom-[14%] h-[18%] rounded-[1.5rem] bg-stone-300/45 blur-xl" />
                <div className="pointer-events-none absolute inset-x-[22%] top-[22%] h-[36%] rounded-[1.75rem] bg-white/16" />
              </>
            ) : (
              <>
                <div className="pointer-events-none absolute inset-x-[18%] top-[16%] h-[12%] rounded-[1.25rem] bg-stone-200/65 blur-lg" />
                <div className="pointer-events-none absolute inset-x-[24%] top-[26%] h-[28%] rounded-[1.75rem] border border-white/40 bg-white/10" />
                <div className="pointer-events-none absolute inset-x-[20%] bottom-[16%] h-[14%] rounded-[1.5rem] bg-stone-300/38 blur-xl" />
              </>
            )}

            <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-stone-200 bg-white/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500 shadow-sm">
              {fallbackMockupAsset?.note}
            </div>
          </div>
        )}

        {isLogoSelected ? (
          <div className="pointer-events-none absolute right-3 top-3 rounded-full border border-sky-200 bg-white/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700 shadow-sm">
            Edition active
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-x-4 bottom-4 text-center">
          <p className="text-sm font-medium text-stone-800">
            {productName} • {productColorLabel}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-stone-500">
            Vue {getViewLabel(activeView)}
          </p>
        </div>
      </div>
    </div>
  )
}

function isWithinSelectionSafeArea(
  eventTarget: Node,
  logoLayerElement: HTMLDivElement,
  selectionSafeAreaElement: HTMLDivElement | null,
) {
  if (logoLayerElement.contains(eventTarget)) {
    return true
  }

  return Boolean(
    selectionSafeAreaElement &&
      selectionSafeAreaElement.contains(eventTarget),
  )
}

function getStageClasses(mockup: ProductMockup, showRealMockup: boolean) {
  switch (mockup) {
    case 'cap':
      return 'relative flex h-64 w-full items-center justify-center sm:h-72 xl:h-80'
    case 'generic':
      return showRealMockup
        ? 'relative flex h-[24rem] w-full items-center justify-center sm:h-[28rem] xl:h-[32rem]'
        : 'relative flex h-[24rem] w-full items-center justify-center sm:h-[28rem] xl:h-[32rem]'
    case 'polo':
    case 'sweatshirt':
    case 'tshirt':
    default:
      return showRealMockup
        ? 'relative flex h-[24rem] w-full items-center justify-center sm:h-[28rem] xl:h-[32rem]'
        : 'relative flex h-[24rem] w-full items-center justify-center sm:h-[28rem] xl:h-[32rem]'
  }
}

function getImageMockupFrameClasses(mockup: ProductMockup) {
  switch (mockup) {
    case 'cap':
      return 'relative h-48 w-72 sm:h-56 sm:w-80 xl:h-60 xl:w-[24rem]'
    case 'generic':
      return 'relative h-[22rem] w-[17rem] sm:h-[25rem] sm:w-[19rem] xl:h-[29rem] xl:w-[22rem]'
    case 'polo':
    case 'sweatshirt':
    case 'tshirt':
    default:
      return 'relative h-[22rem] w-[17rem] sm:h-[25rem] sm:w-[19rem] xl:h-[29rem] xl:w-[22rem]'
  }
}

function getFallbackMockupClasses(mockup: ProductMockup, view: ProductViewId) {
  switch (mockup) {
    case 'cap':
      return view === 'front'
        ? "relative h-32 w-56 overflow-visible rounded-[50%_50%_38%_38%/70%_70%_34%_34%] border border-stone-300/90 bg-gradient-to-b from-white via-stone-100 to-stone-300 shadow-[0_28px_46px_-26px_rgba(120,113,108,0.34)] after:absolute after:-bottom-5 after:left-1/2 after:h-10 after:w-28 after:-translate-x-1/2 after:rounded-b-[999px] after:border after:border-stone-300/90 after:bg-gradient-to-b after:from-stone-200 after:to-stone-400 after:shadow-[0_14px_20px_-16px_rgba(120,113,108,0.3)] after:content-['']"
        : "relative h-32 w-52 overflow-hidden rounded-[48%_48%_40%_40%/62%_62%_34%_34%] border border-stone-300/90 bg-gradient-to-b from-stone-200 via-white to-stone-300 shadow-[0_28px_46px_-26px_rgba(120,113,108,0.34)]"
    case 'polo':
      return view === 'front'
        ? "relative h-64 w-52 overflow-hidden rounded-[2.25rem] border border-stone-300/90 bg-gradient-to-b from-white via-stone-100 to-stone-300 shadow-[0_34px_56px_-30px_rgba(120,113,108,0.34)] sm:h-72 sm:w-56"
        : 'relative h-64 w-52 overflow-hidden rounded-[2.2rem] border border-stone-300/90 bg-gradient-to-b from-stone-200 via-white to-stone-300 shadow-[0_34px_56px_-30px_rgba(120,113,108,0.34)] sm:h-72 sm:w-56'
    case 'sweatshirt':
      return view === 'front'
        ? 'relative h-64 w-56 overflow-hidden rounded-[2.6rem] border border-stone-300/90 bg-gradient-to-b from-white via-stone-100 to-stone-300 shadow-[0_34px_56px_-30px_rgba(120,113,108,0.34)] sm:h-72 sm:w-60 before:absolute before:-left-5 before:top-20 before:h-28 before:w-11 before:rounded-l-[2.2rem] before:border before:border-r-0 before:border-stone-300/90 before:bg-stone-200 before:content-[\'\'] after:absolute after:-right-5 after:top-20 after:h-28 after:w-11 after:rounded-r-[2.2rem] after:border after:border-l-0 after:border-stone-300/90 after:bg-stone-200 after:content-[\'\']'
        : 'relative h-64 w-56 overflow-hidden rounded-[2.5rem] border border-stone-300/90 bg-gradient-to-b from-stone-200 via-white to-stone-300 shadow-[0_34px_56px_-30px_rgba(120,113,108,0.34)] sm:h-72 sm:w-60 before:absolute before:-left-5 before:top-18 before:h-30 before:w-11 before:rounded-l-[2.2rem] before:border before:border-r-0 before:border-stone-300/90 before:bg-stone-200 before:content-[\'\'] after:absolute after:-right-5 after:top-18 after:h-30 after:w-11 after:rounded-r-[2.2rem] after:border after:border-l-0 after:border-stone-300/90 after:bg-stone-200 after:content-[\'\']'
    case 'generic':
      return 'relative h-64 w-52 overflow-hidden rounded-[1.5rem] border border-stone-300/90 bg-gradient-to-b from-white via-stone-100 to-stone-300 shadow-[0_34px_56px_-30px_rgba(120,113,108,0.34)] sm:h-72 sm:w-56'
    case 'tshirt':
    default:
      return view === 'front'
        ? 'relative h-64 w-52 overflow-hidden rounded-[2.25rem] border border-stone-300/90 bg-gradient-to-b from-white via-stone-100 to-stone-300 shadow-[0_34px_56px_-30px_rgba(120,113,108,0.34)] sm:h-72 sm:w-56 before:absolute before:-left-4 before:top-14 before:h-16 before:w-10 before:rounded-l-[1.6rem] before:border before:border-r-0 before:border-stone-300/90 before:bg-stone-200 before:content-[\'\'] after:absolute after:-right-4 after:top-14 after:h-16 after:w-10 after:rounded-r-[1.6rem] after:border after:border-l-0 after:border-stone-300/90 after:bg-stone-200 after:content-[\'\']'
        : 'relative h-64 w-52 overflow-hidden rounded-[2.15rem] border border-stone-300/90 bg-gradient-to-b from-stone-200 via-white to-stone-300 shadow-[0_34px_56px_-30px_rgba(120,113,108,0.34)] sm:h-72 sm:w-56 before:absolute before:-left-4 before:top-16 before:h-18 before:w-10 before:rounded-l-[1.5rem] before:border before:border-r-0 before:border-stone-300/90 before:bg-stone-200 before:content-[\'\'] after:absolute after:-right-4 after:top-16 after:h-18 after:w-10 after:rounded-r-[1.5rem] after:border after:border-l-0 after:border-stone-300/90 after:bg-stone-200 after:content-[\'\']'
  }
}

function renderMockupDetails(mockup: ProductMockup, view: ProductViewId) {
  switch (mockup) {
    case 'tshirt':
      return view === 'front' ? (
        <>
          <div className="pointer-events-none absolute left-1/2 top-4 h-7 w-14 -translate-x-1/2 rounded-b-[1.2rem] border border-stone-300/80 bg-white/95" />
          <div className="pointer-events-none absolute left-1/2 top-7 h-8 w-20 -translate-x-1/2 rounded-b-[1.4rem] bg-white/38" />
          <div className="pointer-events-none absolute inset-x-[28%] bottom-[7%] h-[7%] rounded-full border-t border-stone-300/75" />
        </>
      ) : (
        <>
          <div className="pointer-events-none absolute inset-x-[28%] top-[8%] h-[5%] rounded-full border-t border-stone-300/80" />
          <div className="pointer-events-none absolute inset-x-[30%] bottom-[7%] h-[6%] rounded-full border-t border-stone-300/75" />
        </>
      )
    case 'sweatshirt':
      return (
        <>
          <div className="pointer-events-none absolute left-1/2 top-4 h-8 w-16 -translate-x-1/2 rounded-b-[1.35rem] border border-stone-300/80 bg-white/90" />
          <div className="pointer-events-none absolute inset-x-[22%] bottom-[7%] h-[8%] rounded-full border-t-2 border-stone-300/80 bg-stone-100/60" />
          <div className="pointer-events-none absolute left-[6%] top-[66%] h-[14%] w-[7%] rounded-l-[1rem] border border-stone-300/75 bg-stone-100/75" />
          <div className="pointer-events-none absolute right-[6%] top-[66%] h-[14%] w-[7%] rounded-r-[1rem] border border-stone-300/75 bg-stone-100/75" />
        </>
      )
    case 'polo':
      return view === 'front' ? (
        <>
          <div className="pointer-events-none absolute left-1/2 top-4 h-9 w-16 -translate-x-1/2 rounded-b-[1.3rem] border border-stone-300/85 bg-white/95" />
          <div className="pointer-events-none absolute left-1/2 top-8 h-11 w-[2px] -translate-x-1/2 rounded-full bg-stone-400/70" />
          <div className="pointer-events-none absolute left-1/2 top-[2.55rem] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-stone-400/75 shadow-[0_0.45rem_0_0_rgba(168,162,158,0.75),0_0.9rem_0_0_rgba(168,162,158,0.75)]" />
        </>
      ) : (
        <div className="pointer-events-none absolute inset-x-[26%] top-[8%] h-[5%] rounded-full border-t border-stone-300/75" />
      )
    case 'cap':
      return view === 'front' ? (
        <>
          <div className="pointer-events-none absolute inset-x-[16%] top-[14%] h-[24%] rounded-[50%] border-t border-stone-300/75" />
          <div className="pointer-events-none absolute left-1/2 top-[10%] h-[28%] w-[2px] -translate-x-1/2 bg-stone-300/70" />
          <div className="pointer-events-none absolute inset-x-[35%] top-[28%] h-[12%] rounded-full bg-white/35 blur-sm" />
        </>
      ) : (
        <>
          <div className="pointer-events-none absolute left-1/2 top-4 h-6 w-6 -translate-x-1/2 rounded-full border border-stone-300/80 bg-white/90" />
          <div className="pointer-events-none absolute inset-x-[20%] top-[20%] h-[18%] rounded-[50%] border-t border-stone-300/70" />
          <div className="pointer-events-none absolute inset-x-[30%] bottom-[18%] h-[8%] rounded-full border-t border-stone-300/70" />
        </>
      )
    case 'generic':
      return (
        <>
          <div className="pointer-events-none absolute inset-x-[10%] top-[10%] h-[10%] rounded-[1rem] bg-white/45" />
          <div className="pointer-events-none absolute inset-x-[14%] inset-y-[14%] rounded-[1.1rem] border border-white/35" />
          <div className="pointer-events-none absolute inset-x-[18%] bottom-[10%] h-[8%] rounded-[0.9rem] bg-stone-200/60" />
        </>
      )
    default:
      return null
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
