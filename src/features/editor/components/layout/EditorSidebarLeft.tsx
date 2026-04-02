import { PanelCard } from '../../../../components/ui/PanelCard'
import type { Product, ProductColorId, UploadedLogo } from '../../types'
import { LogoUploadPanel } from '../panels/LogoUploadPanel'
import { ProductColorSelector } from '../selectors/ProductColorSelector'
import { ProductSelector } from '../selectors/ProductSelector'

type EditorSidebarLeftProps = {
  logo: UploadedLogo | null
  logoErrorMessage: string | null
  onColorSelect: (colorId: ProductColorId) => void
  onLogoFileSelect: (file: File | null) => void
  onLogoRemove: () => void
  onProductSelect: (productId: Product['id']) => void
  products: Product[]
  selectedColorId: ProductColorId
  selectedProduct: Product
  selectedProductId: Product['id']
}

export function EditorSidebarLeft({
  logo,
  logoErrorMessage,
  onColorSelect,
  onLogoFileSelect,
  onLogoRemove,
  onProductSelect,
  products,
  selectedColorId,
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
        <div className="rounded-[1rem] border border-stone-200 bg-stone-50/75 p-2">
          <ProductSelector
            products={products}
            selectedProductId={selectedProductId}
            onSelect={onProductSelect}
          />
        </div>

        <ProductColorSelector
          product={selectedProduct}
          selectedColorId={selectedColorId}
          onSelect={onColorSelect}
        />

        <LogoUploadPanel
          logo={logo}
          errorMessage={logoErrorMessage}
          onFileSelect={onLogoFileSelect}
          onRemove={onLogoRemove}
        />
      </PanelCard>
    </aside>
  )
}
