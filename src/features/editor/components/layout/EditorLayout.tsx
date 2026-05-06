import { useEffect, useRef, useState } from 'react'

import { useEditorStudio } from '../../hooks/useEditorStudio'
import { calculateEditorPrice, defaultTextileUnitPrice } from '../../pricing'
import type { EditorStudioConfiguration } from '../../types'
import { ProductQuantityPanel } from '../panels/ProductQuantityPanel'
import { EditorCanvasArea } from './EditorCanvasArea'
import { EditorSidebarLeft } from './EditorSidebarLeft'
import { EditorSidebarRight } from './EditorSidebarRight'

type EditorLayoutProps = {
  onAddToCart?: (configuration: EditorStudioConfiguration) => void
  onOpenCart?: () => void
}

export function EditorLayout({ onAddToCart, onOpenCart }: EditorLayoutProps) {
  const logoInspectorRef = useRef<HTMLDivElement | null>(null)
  const [addToCartFeedbackMessage, setAddToCartFeedbackMessage] = useState<
    string | null
  >(null)
  const {
    activeLogoElement,
    activeLogoElements,
    activeProductView,
    activeView,
    availableViews,
    customPlacement,
    elementsByView,
    handleColorSelect,
    handleElementSelect,
    handleLogoFileSelect,
    handleLogoPositionChange,
    handleLogoRemove,
    handleLogoSizeChange,
    handleProductSelect,
    handleQuantityChange,
    logoErrorMessage,
    products,
    quantitiesByProduct,
    selectedColor,
    selectedColorId,
    selectedElementId,
    selectedProduct,
    setCustomPlacement,
    setActiveView,
    totalQuantity,
  } = useEditorStudio()

  useEffect(() => {
    if (!addToCartFeedbackMessage) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setAddToCartFeedbackMessage(null)
    }, 8000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [addToCartFeedbackMessage])

  if (!selectedProduct || !selectedColor) {
    return null
  }

  const allLogoElements = Object.values(elementsByView).flat()
  const hasLogoElements = allLogoElements.length > 0
  const hasValidQuantity = totalQuantity > 0
  const pricing = calculateEditorPrice({
    logos: hasLogoElements
      ? allLogoElements.map((logoElement) => ({
          id: logoElement.id,
          printFormat: logoElement.printFormat,
        }))
      : [],
    textileUnitPrice: defaultTextileUnitPrice,
    totalQuantity: hasLogoElements ? totalQuantity : 0,
  })
  const canAddToCart = Boolean(selectedProduct && hasValidQuantity && hasLogoElements)
  const addToCartDisabledMessage = !hasLogoElements
    ? 'Ajoutez au moins un logo pour commander une personnalisation.'
    : !hasValidQuantity
      ? 'Ajoutez une quantité pour continuer.'
      : null

  function handleAddToCart() {
    if (!onAddToCart || !canAddToCart || !selectedColor || !selectedProduct) {
      return
    }

    onAddToCart({
      color: selectedColor,
      customPlacement,
      elementsByView,
      pricing,
      product: selectedProduct,
      quantities: quantitiesByProduct,
    })
    setAddToCartFeedbackMessage('Produit ajouté au panier')
  }

  return (
    <section className="grid w-full max-w-full gap-3.5 md:gap-4 lg:grid-cols-[minmax(17.5rem,18rem)_minmax(0,1fr)_minmax(13rem,14rem)] lg:items-start xl:grid-cols-[18rem_minmax(0,2.2fr)_15rem] 2xl:grid-cols-[18rem_minmax(0,2.4fr)_15.5rem]">
      <div className="min-w-0 max-w-full lg:max-w-[18rem]">
        <EditorSidebarLeft
          logos={activeLogoElements}
          logo={activeLogoElement?.asset ?? null}
          logoErrorMessage={logoErrorMessage}
          onLogoSelect={handleElementSelect}
          onLogoFileSelect={handleLogoFileSelect}
          onLogoRemove={handleLogoRemove}
          onColorSelect={handleColorSelect}
          products={products}
          selectedColorId={selectedColorId}
          selectedElementId={selectedElementId}
          selectedProductId={selectedProduct.id}
          selectedProduct={selectedProduct}
          onProductSelect={handleProductSelect}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-3.5">
        <EditorCanvasArea
          logoElements={activeLogoElements}
          onLogoPositionChange={handleLogoPositionChange}
          onLogoSizeChange={handleLogoSizeChange}
          selectedElementId={selectedElementId}
          onElementSelect={handleElementSelect}
          product={selectedProduct}
          productColor={selectedColor}
          activeView={activeView}
          availableViews={availableViews}
          customPlacement={customPlacement}
          onCustomPlacementChange={setCustomPlacement}
          onViewSelect={setActiveView}
          productView={activeProductView}
          selectionSafeAreaRef={logoInspectorRef}
        />

        <ProductQuantityPanel
          quantities={quantitiesByProduct}
          sizes={selectedProduct.sizes}
          totalQuantity={totalQuantity}
          onQuantityChange={handleQuantityChange}
        />
      </div>

      <div
        ref={logoInspectorRef}
        className="min-w-0 lg:max-w-[14rem] xl:max-w-[15.5rem] xl:justify-self-end"
      >
        <EditorSidebarRight
          activeView={activeView}
          addToCartFeedbackMessage={addToCartFeedbackMessage}
          addToCartDisabledMessage={addToCartDisabledMessage}
          canAddToCart={canAddToCart}
          grandTotal={pricing.grandTotal}
          onAddToCart={handleAddToCart}
          printTotal={pricing.printTotal}
          product={selectedProduct}
          productColor={selectedColor}
          textileTotal={pricing.textileTotal}
          totalQuantity={totalQuantity}
        />
      </div>

      {addToCartFeedbackMessage ? (
        <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-[1.1rem] border border-emerald-200 bg-white p-3.5 shadow-[0_22px_48px_-26px_rgba(15,23,42,0.42)] sm:left-auto sm:right-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-emerald-800">
              {addToCartFeedbackMessage}
            </p>
            <button
              type="button"
              aria-label="Fermer la notification"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-sm font-semibold text-stone-500 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-800"
              onClick={() => setAddToCartFeedbackMessage(null)}
            >
              X
            </button>
          </div>
          <p className="mt-1 text-sm leading-5 text-stone-500">
            Votre configuration a été conservée dans le panier.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              className="rounded-[0.9rem] bg-blue-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
              onClick={() => {
                setAddToCartFeedbackMessage(null)
                onOpenCart?.()
              }}
            >
              Voir le panier
            </button>
            <button
              type="button"
              className="rounded-[0.9rem] border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-950 transition hover:bg-white"
              onClick={() => setAddToCartFeedbackMessage(null)}
            >
              Continuer la personnalisation
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
