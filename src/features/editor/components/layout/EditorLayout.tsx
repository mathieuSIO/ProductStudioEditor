import { useRef } from 'react'

import { useEditorStudio } from '../../hooks/useEditorStudio'
import { calculateEditorPrice, defaultTextileUnitPrice } from '../../pricing'
import { ProductQuantityPanel } from '../panels/ProductQuantityPanel'
import { EditorCanvasArea } from './EditorCanvasArea'
import { EditorSidebarLeft } from './EditorSidebarLeft'
import { EditorSidebarRight } from './EditorSidebarRight'

export function EditorLayout() {
  const logoInspectorRef = useRef<HTMLDivElement | null>(null)
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
    handleLogoControlsChange,
    handleLogoFileSelect,
    handleLogoPositionChange,
    handleLogoRemove,
    handleLogoSizeChange,
    handleProductSelect,
    handleQuantityChange,
    logoControls,
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

  return (
    <section className="grid gap-2.5 md:gap-3 lg:grid-cols-[minmax(13.5rem,14.25rem)_minmax(0,1fr)] xl:grid-cols-[13.5rem_minmax(0,2.2fr)_14.25rem] xl:items-start 2xl:grid-cols-[13.75rem_minmax(0,2.4fr)_14.5rem]">
      <div className="order-2 lg:order-1 xl:order-1 xl:max-w-[13.5rem]">
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

      <div className="order-1 flex flex-col gap-2.5 lg:row-span-2 xl:order-2">
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
        className="order-3 lg:order-2 xl:order-3 xl:max-w-[14.5rem] xl:justify-self-end"
      >
        <EditorSidebarRight
          activeView={activeView}
          grandTotal={pricing.grandTotal}
          logoElement={activeLogoElement}
          logoControls={logoControls}
          logosCount={pricing.logosCount}
          onLogoControlsChange={handleLogoControlsChange}
          printTotal={pricing.printTotal}
          product={selectedProduct}
          productColor={selectedColor}
          productView={activeProductView}
          selectedElementId={selectedElementId}
          textileTotal={pricing.textileTotal}
          totalQuantity={pricing.totalQuantity}
        />
      </div>
    </section>
  )
}
