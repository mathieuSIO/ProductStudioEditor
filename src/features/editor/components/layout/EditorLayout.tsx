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
}

export function EditorLayout({ onAddToCart }: EditorLayoutProps) {
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
    }, 2500)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [addToCartFeedbackMessage])

  if (!selectedProduct || !selectedColor) {
    return null
  }

  const allLogoElements = Object.values(elementsByView).flat()
  const pricing = calculateEditorPrice({
    logos: allLogoElements.map((logoElement) => ({
      id: logoElement.id,
      printFormat: logoElement.printFormat,
    })),
    textileUnitPrice: defaultTextileUnitPrice,
    totalQuantity,
  })
  const canAddToCart = pricing.totalQuantity > 0

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
    <section className="grid gap-3.5 md:gap-4 lg:grid-cols-[minmax(13.5rem,14.25rem)_minmax(0,1fr)] xl:grid-cols-[13.75rem_minmax(0,2.2fr)_15rem] xl:items-start 2xl:grid-cols-[14rem_minmax(0,2.4fr)_15.5rem]">
      <div className="order-2 lg:order-1 xl:order-1 xl:max-w-[14rem]">
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

      <div className="order-1 flex flex-col gap-3.5 lg:row-span-2 xl:order-2">
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
        className="order-3 lg:order-2 xl:order-3 xl:max-w-[15.5rem] xl:justify-self-end"
      >
        <EditorSidebarRight
          activeView={activeView}
          addToCartFeedbackMessage={addToCartFeedbackMessage}
          canAddToCart={canAddToCart}
          grandTotal={pricing.grandTotal}
          onAddToCart={handleAddToCart}
          printTotal={pricing.printTotal}
          product={selectedProduct}
          productColor={selectedColor}
          textileTotal={pricing.textileTotal}
          totalQuantity={pricing.totalQuantity}
        />
      </div>
    </section>
  )
}
