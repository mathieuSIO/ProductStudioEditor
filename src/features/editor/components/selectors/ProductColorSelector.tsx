import type { Product, ProductColorId } from '../../types'

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

  return (
    <div className="rounded-[0.95rem] border border-blue-100 bg-white px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
        Couleur du produit
      </p>
      <p className="mt-1 text-sm leading-5 text-stone-500">
        Sélectionnez la couleur qui mettra le mieux votre logo en valeur.
      </p>

      {supportedColors.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {supportedColors.map((color) => (
            <ColorOption
              key={color.id}
              isSelected={color.id === selectedColorId}
              onSelect={onSelect}
              colorId={color.id}
              label={color.label}
              swatchHex={color.swatchHex}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

type ColorOptionProps = {
  colorId: ProductColorId
  isSelected: boolean
  label: string
  onSelect: (colorId: ProductColorId) => void
  swatchHex: string
}

function ColorOption({
  colorId,
  isSelected,
  label,
  onSelect,
  swatchHex,
}: ColorOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(colorId)}
      aria-pressed={isSelected}
      className={`flex items-center justify-between rounded-[0.9rem] border px-3 py-2.5 text-left transition-colors ${
        isSelected
          ? 'border-blue-950 bg-blue-950 text-white shadow-[0_18px_35px_-26px_rgba(15,23,42,0.6)]'
          : 'border-blue-100 bg-blue-50 text-blue-950 hover:border-blue-200 hover:bg-white'
      }`}
    >
      <span className="flex items-center gap-3">
        <span
          className="h-5 w-5 rounded-full border border-black/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
          style={{ backgroundColor: swatchHex }}
        />
        <span className="text-sm font-semibold">{label}</span>
      </span>

      <span
        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
          isSelected
            ? 'bg-white/12 text-white'
            : 'border border-red-100 bg-white text-red-600'
        }`}
      >
        {isSelected ? 'Choisie' : 'Choisir'}
      </span>
    </button>
  )
}
