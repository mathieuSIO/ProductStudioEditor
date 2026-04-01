import { useEditorStudio } from '../hooks/useEditorStudio'
import { EditorCanvasArea } from './EditorCanvasArea'
import { EditorSidebarLeft } from './EditorSidebarLeft'
import { EditorSidebarRight } from './EditorSidebarRight'

export function EditorLayout() {
  const {
    activeLogoElement,
    activeProductView,
    activeView,
    availableViews,
    handleColorSelect,
    handleElementSelect,
    handleLogoControlsChange,
    handleLogoFileSelect,
    handleLogoPositionChange,
    handleLogoRemove,
    handleLogoSizeChange,
    handleProductSelect,
    logoControls,
    logoErrorMessage,
    products,
    selectedColor,
    selectedColorId,
    selectedElementId,
    selectedProduct,
    setActiveView,
  } = useEditorStudio()

  if (!selectedProduct || !selectedColor || !activeProductView) {
    return null
  }

  return (
    <section className="grid gap-2.5 md:gap-3 lg:grid-cols-[minmax(13.5rem,14.25rem)_minmax(0,1fr)] xl:grid-cols-[13.5rem_minmax(0,2.2fr)_14.25rem] xl:items-start 2xl:grid-cols-[13.75rem_minmax(0,2.4fr)_14.5rem]">
      <div className="order-2 lg:order-1 xl:order-1 xl:max-w-[13.5rem]">
        <EditorSidebarLeft
          logo={activeLogoElement?.asset ?? null}
          logoErrorMessage={logoErrorMessage}
          onLogoFileSelect={handleLogoFileSelect}
          onLogoRemove={handleLogoRemove}
          onColorSelect={handleColorSelect}
          products={products}
          selectedColorId={selectedColorId}
          selectedProductId={selectedProduct.id}
          selectedProduct={selectedProduct}
          onProductSelect={handleProductSelect}
        />
      </div>

      <div className="order-1 lg:row-span-2 xl:order-2">
        <EditorCanvasArea
          logoElement={activeLogoElement}
          onLogoPositionChange={handleLogoPositionChange}
          onLogoSizeChange={handleLogoSizeChange}
          selectedElementId={selectedElementId}
          onElementSelect={handleElementSelect}
          product={selectedProduct}
          productColor={selectedColor}
          activeView={activeView}
          availableViews={availableViews}
          onViewSelect={setActiveView}
          productView={activeProductView}
        />
      </div>

      <div className="order-3 lg:order-2 xl:order-3 xl:max-w-[14.5rem] xl:justify-self-end">
        <EditorSidebarRight
          activeView={activeView}
          logoElement={activeLogoElement}
          logoControls={logoControls}
          onLogoControlsChange={handleLogoControlsChange}
          product={selectedProduct}
          productColor={selectedColor}
          productView={activeProductView}
          selectedElementId={selectedElementId}
        />
      </div>
    </section>
  )
}
