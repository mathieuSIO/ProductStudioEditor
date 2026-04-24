import type { ReactNode } from 'react'

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
    <aside className="overflow-hidden rounded-[1.35rem] border border-blue-100 bg-white shadow-[0_16px_38px_-30px_rgba(15,23,42,0.22)]">
      <div className="border-b border-blue-100 bg-blue-950 px-3.5 py-3 text-white">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-100">
          Personnalisation
        </p>
        <h2 className="mt-1 text-base font-semibold tracking-tight">
          Créez votre produit
        </h2>
        <p className="mt-1 text-sm leading-5 text-blue-100">
          Suivez les étapes pour préparer une configuration prête à commander.
        </p>
      </div>

      <div className="grid gap-3 p-3">
        <GuidedStep
          description="Sélectionnez la base à personnaliser."
          isComplete={Boolean(selectedProductId)}
          number="1"
          title="Produit"
        >
          <ProductSelector
            products={products}
            selectedProductId={selectedProductId}
            onSelect={onProductSelect}
          />
        </GuidedStep>

        <GuidedStep
          description="Choisissez la couleur du textile."
          isComplete={Boolean(selectedColorId)}
          number="2"
          title="Couleur"
        >
          <ProductColorSelector
            product={selectedProduct}
            selectedColorId={selectedColorId}
            onSelect={onColorSelect}
          />
        </GuidedStep>

        <GuidedStep
          description="Importez un visuel et placez-le sur le mockup."
          isComplete={logos.length > 0}
          number="3"
          title="Logo"
        >
          <LogoUploadPanel
            logos={logos}
            logo={logo}
            errorMessage={logoErrorMessage}
            onFileSelect={onLogoFileSelect}
            onRemove={onLogoRemove}
            onSelect={onLogoSelect}
            selectedElementId={selectedElementId}
          />
        </GuidedStep>
      </div>
    </aside>
  )
}

type GuidedStepProps = {
  children: ReactNode
  description: string
  isComplete: boolean
  number: string
  title: string
}

function GuidedStep({
  children,
  description,
  isComplete,
  number,
  title,
}: GuidedStepProps) {
  return (
    <section className="rounded-[1.05rem] border border-blue-100 bg-blue-50/55 p-2.5">
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-semibold text-white">
            {number}
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-blue-950">{title}</h3>
            <p className="mt-0.5 text-xs leading-4 text-blue-700">
              {description}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
            isComplete
              ? 'bg-white text-red-600 ring-1 ring-red-100'
              : 'bg-white/70 text-blue-500 ring-1 ring-blue-100'
          }`}
        >
          {isComplete ? 'OK' : 'À faire'}
        </span>
      </div>

      {children}
    </section>
  )
}
