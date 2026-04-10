import { PanelCard } from '../../../../components/ui/PanelCard'
import type {
  DesignElement,
  EditorElementId,
  Product,
  ProductColorId,
  UploadedLogo,
} from '../../types'
import { LogoUploadPanel } from '../panels/LogoUploadPanel'
import { ProductColorSelector } from '../selectors/ProductColorSelector'
import { ProductSelector } from '../selectors/ProductSelector'

type EditorSidebarLeftProps = {
  logos: DesignElement[]
  logo: UploadedLogo | null
  logoErrorMessage: string | null
  onColorSelect: (colorId: ProductColorId) => void
  onLogoFileSelect: (file: File | null) => void
  onLogoRemove: () => void
  onLogoSelect: (elementId: EditorElementId | null) => void
  onProductSelect: (productId: Product['id']) => void
  products: Product[]
  selectedColorId: ProductColorId
  selectedElementId: EditorElementId | null
  selectedProduct: Product
  selectedProductId: Product['id']
}

export function EditorSidebarLeft({
  logos,
  logo,
  logoErrorMessage,
  onColorSelect,
  onLogoFileSelect,
  onLogoRemove,
  onLogoSelect,
  onProductSelect,
  products,
  selectedColorId,
  selectedElementId,
  selectedProduct,
  selectedProductId,
}: EditorSidebarLeftProps) {
  return (
    <aside className="flex flex-col gap-2.5">
      <PanelCard
        eyebrow=""
        title="Outils du studio"
        description="Selection produit, couleur et import du visuel."
        aside={
          <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            Outils
          </span>
        }
      >
        <ProductSelector
          products={products}
          selectedProductId={selectedProductId}
          onSelect={onProductSelect}
        />

        <ProductColorSelector
          product={selectedProduct}
          selectedColorId={selectedColorId}
          onSelect={onColorSelect}
        />

        <LogoUploadPanel
          logos={logos}
          logo={logo}
          errorMessage={logoErrorMessage}
          onFileSelect={onLogoFileSelect}
          onRemove={onLogoRemove}
          onSelect={onLogoSelect}
          selectedElementId={selectedElementId}
        />
      </PanelCard>
    </aside>
  )
}
