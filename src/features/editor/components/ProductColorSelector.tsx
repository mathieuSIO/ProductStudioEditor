import type { Product, ProductColorId } from '../types'

type ProductColorSelectorProps = {
  onSelect: (colorId: ProductColorId) => void
  product: Product
  selectedColorId: ProductColorId
}

export function ProductColorSelector({
  onSelect,
  product,
  selectedColorId,
}: ProductColorSelectorProps) {
  const supportedColors = product.colors.filter(
    (color) => color.availability === 'real',
  )
  // const fallbackColors = product.colors.filter(
  //   (color) => color.availability === 'fallback',
  // )

  return (
    <div className="rounded-[1.1rem] border border-stone-200 bg-white px-3 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
            Couleur produit
          </p>
          <p className="mt-1.5 text-sm leading-5 text-stone-500">
            Noir et blanc utilisent les mockups reels disponibles. Les autres
            teintes restent accessibles via un apercu simplifie.
          </p>
        </div>
        <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
          Couleurs
        </span>
      </div>

      {supportedColors.length > 0 ? (
        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
            Mockups reels
          </p>
          <div className="mt-2 grid gap-2">
            {supportedColors.map((color) => (
              <ColorOption
                key={color.id}
                availabilityLabel="Mockup reel disponible"
                isSelected={color.id === selectedColorId}
                onSelect={onSelect}
                colorId={color.id}
                label={color.label}
                swatchHex={color.swatchHex}
                tone="supported"
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* {fallbackColors.length > 0 ? (
        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
            Apercus simplifies
          </p>
          <div className="mt-2 grid gap-2">
            {fallbackColors.map((color) => (
              <ColorOption
                key={color.id}
                availabilityLabel="Apercu simplifie"
                isSelected={color.id === selectedColorId}
                onSelect={onSelect}
                colorId={color.id}
                label={color.label}
                swatchHex={color.swatchHex}
                tone="fallback"
              />
            ))}
          </div>
        </div>
      ) : null} */}

      {/* <div className="mt-3 rounded-[0.95rem] border border-dashed border-stone-300 bg-stone-50/80 px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
          Transparence preview
        </p>
        <p className="mt-1.5 text-sm leading-5 text-stone-500">
          Les couleurs sans mockup photo ne pretendent pas reproduire un rendu
          e-commerce final. Elles servent uniquement de repere visuel.
        </p>
      </div> */}
    </div>
  )
}

type ColorOptionProps = {
  availabilityLabel: string
  colorId: ProductColorId
  isSelected: boolean
  label: string
  onSelect: (colorId: ProductColorId) => void
  swatchHex: string
  tone: 'fallback' | 'supported'
}

function ColorOption({
  availabilityLabel,
  colorId,
  isSelected,
  label,
  onSelect,
  swatchHex,
  tone,
}: ColorOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(colorId)}
      aria-pressed={isSelected}
      className={`flex items-center justify-between rounded-[0.95rem] border px-3 py-2.5 text-left transition-colors ${
        isSelected
          ? 'border-stone-900 bg-stone-900 text-white shadow-[0_18px_35px_-24px_rgba(28,25,23,0.4)]'
          : tone === 'supported'
            ? 'border-emerald-200 bg-emerald-50/60 text-stone-700 hover:border-emerald-300'
            : 'border-stone-200 bg-stone-50/80 text-stone-700 hover:border-stone-300'
      }`}
    >
      <span className="flex items-center gap-3">
        <span
          className="h-5 w-5 rounded-full border border-black/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
          style={{ backgroundColor: swatchHex }}
        />
        <span>
          <span className="block text-sm font-medium">{label}</span>
          <span
            className={`block text-xs ${
              isSelected ? 'text-white/75' : 'text-stone-500'
            }`}
          >
            {availabilityLabel}
          </span>
        </span>
      </span>

      <span
        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
          isSelected
            ? 'bg-white/12 text-white'
            : tone === 'supported'
              ? 'border border-emerald-200 bg-white text-emerald-700'
              : 'border border-stone-200 bg-white text-stone-500'
        }`}
      >
        {tone === 'supported' ? 'Reel' : 'Fallback'}
      </span>
    </button>
  )
}
