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
    <section className="grid gap-3 md:gap-4 lg:grid-cols-[minmax(15rem,16.5rem)_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,1.95fr)_15rem] xl:items-start 2xl:grid-cols-[14.5rem_minmax(0,2.15fr)_15.5rem]">
      <div className="order-2 lg:order-1 xl:order-1 xl:max-w-[14rem]">
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

      <div className="order-3 lg:order-2 xl:order-3 xl:max-w-[15.5rem] xl:justify-self-end">
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
