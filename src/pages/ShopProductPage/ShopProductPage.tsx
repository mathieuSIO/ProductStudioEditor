import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { AppShell } from '../../components/layout/AppShell'
import { createCartItemFromShopProduct, useCart } from '../../features/cart'
import { formatEuro } from '../../shared/formatters/formatEuro'
import {
  fetchShopProductBySlug,
  ShopProductImage,
  type ShopProduct,
  type ShopProductVariant,
} from '../../features/shop'

export function ShopProductPage() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState<ShopProduct | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedColorName, setSelectedColorName] = useState<string | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const activeVariants = useMemo(
    () => product?.variants.filter((variant) => variant.isActive) ?? [],
    [product],
  )
  const availableColors = useMemo(
    () => createAvailableColors(activeVariants),
    [activeVariants],
  )
  const variantsForSelectedColor = useMemo(
    () =>
      selectedColorName
        ? activeVariants.filter(
            (variant) => variant.colorName === selectedColorName,
          )
        : [],
    [activeVariants, selectedColorName],
  )
  const selectedVariant =
    activeVariants.find((variant) => variant.id === selectedVariantId) ?? null
  const displayedPriceCents =
    selectedVariant?.priceCents ?? product?.priceCents ?? 0
  const maxQuantity = selectedVariant?.stockQuantity ?? 1
  const canAddToCart =
    Boolean(product?.isActive) &&
    selectedVariant !== null &&
    selectedVariant.stockQuantity > 0

  useEffect(() => {
    const abortController = new AbortController()

    async function loadProduct() {
      if (!slug) {
        setError('Produit introuvable ou indisponible.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const loadedProduct = await fetchShopProductBySlug(
          slug,
          abortController.signal,
        )
        const defaultVariant = getDefaultVariant(loadedProduct.variants)

        setProduct(loadedProduct)
        setQuantity(1)
        setSelectedColorName(defaultVariant?.colorName ?? null)
        setSelectedVariantId(defaultVariant?.id ?? null)
        setSuccessMessage(null)
      } catch (loadError) {
        if (abortController.signal.aborted) {
          return
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Produit introuvable ou indisponible.',
        )
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadProduct()

    return () => abortController.abort()
  }, [slug])

  function handleAddToCart() {
    if (!product || !canAddToCart || !selectedVariant) {
      return
    }

    addItem(
      createCartItemFromShopProduct({
        product,
        quantity,
        variant: selectedVariant,
      }),
    )
    setSuccessMessage(
      `Produit ajoute au panier : ${selectedVariant.colorName}, taille ${selectedVariant.sizeLabel}.`,
    )
  }

  function handleSelectColor(colorName: string) {
    const nextVariant =
      activeVariants.find(
        (variant) => variant.colorName === colorName && variant.stockQuantity > 0,
      ) ??
      activeVariants.find((variant) => variant.colorName === colorName) ??
      null

    setSelectedColorName(colorName)
    setSelectedVariantId(nextVariant?.id ?? null)
    setQuantity(1)
    setSuccessMessage(null)
  }

  function handleSelectVariant(variant: ShopProductVariant) {
    if (variant.stockQuantity <= 0) {
      return
    }

    setSelectedVariantId(variant.id)
    setQuantity(1)
    setSuccessMessage(null)
  }

  return (
    <AppShell
      title="Boutique"
      subtitle="Produits prets a porter et creations Mon Petit Matos."
      action={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-[1rem] border border-blue-100 bg-white px-4 py-2.5 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            onClick={() => navigate('/boutique')}
          >
            Boutique
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-[1rem] border border-blue-100 bg-white px-4 py-2.5 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            onClick={() => navigate('/')}
          >
            Studio
          </button>
        </div>
      }
      onReturnToStudio={() => navigate('/')}
    >
      <section className="rounded-[1.35rem] border border-stone-200 bg-white px-4 py-5 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.28)] sm:px-5">
        {isLoading ? (
          <StateMessage
            title="Chargement du produit"
            description="Recuperation du detail boutique."
          />
        ) : error || !product ? (
          <StateMessage
            title="Produit indisponible"
            description="Produit introuvable ou indisponible."
            tone="error"
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:items-start">
            <ShopProductImage
              imageUrl={product.imageUrl}
              name={product.name}
              variant="detail"
            />
            <div className="min-w-0 rounded-[1.15rem] border border-stone-200 bg-stone-50 px-4 py-5 sm:px-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Produit boutique
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">
                {product.name}
              </h1>
              {product.description ? (
                <p className="mt-4 text-sm leading-7 text-stone-600">
                  {product.description}
                </p>
              ) : (
                <p className="mt-4 text-sm leading-7 text-stone-500">
                  Description detaillee a venir.
                </p>
              )}
              <p className="mt-5 text-3xl font-semibold tracking-tight text-red-600">
                {formatEuro(displayedPriceCents / 100)}
              </p>
              {!product.isActive ? (
                <p className="mt-3 rounded-[0.95rem] border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-600">
                  Produit actuellement indisponible.
                </p>
              ) : null}
              <div className="mt-5 grid gap-3">
                <ProductVariantSelector
                  availableColors={availableColors}
                  selectedColorName={selectedColorName}
                  selectedVariantId={selectedVariantId}
                  variants={variantsForSelectedColor}
                  onSelectColor={handleSelectColor}
                  onSelectVariant={handleSelectVariant}
                />
                <label className="grid max-w-36 gap-1.5 text-sm font-semibold text-blue-950">
                  Quantite
                  <input
                    className="rounded-[0.9rem] border border-stone-200 bg-white px-3 py-3 text-sm font-medium text-stone-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                    disabled={!canAddToCart}
                    max={Math.max(1, maxQuantity)}
                    min={1}
                    type="number"
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(
                        normalizeQuantityInput(
                          event.currentTarget.value,
                          maxQuantity,
                        ),
                      )
                    }
                  />
                </label>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center justify-center rounded-[1rem] bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"
                  disabled={!canAddToCart}
                  onClick={handleAddToCart}
                >
                  {canAddToCart ? 'Ajouter au panier' : 'Choisissez une taille'}
                </button>
              </div>
              {successMessage ? (
                <div className="mt-4 rounded-[1rem] border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-800">
                  <p>{successMessage}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-[0.9rem] bg-blue-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                      onClick={() => navigate('/?view=cart')}
                    >
                      Voir mon panier
                    </button>
                    <button
                      type="button"
                      className="rounded-[0.9rem] border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:border-blue-100 hover:text-blue-950"
                      onClick={() => navigate('/boutique')}
                    >
                      Continuer mes achats
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  )
}

type AvailableColor = {
  colorHex: string | null
  colorName: string
}

type ProductVariantSelectorProps = {
  availableColors: AvailableColor[]
  onSelectColor: (colorName: string) => void
  onSelectVariant: (variant: ShopProductVariant) => void
  selectedColorName: string | null
  selectedVariantId: number | null
  variants: ShopProductVariant[]
}

function ProductVariantSelector({
  availableColors,
  onSelectColor,
  onSelectVariant,
  selectedColorName,
  selectedVariantId,
  variants,
}: ProductVariantSelectorProps) {
  if (availableColors.length === 0) {
    return (
      <div className="rounded-[0.95rem] border border-stone-200 bg-white px-3 py-3 text-sm font-semibold text-stone-600">
        Aucune variante disponible pour ce produit.
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold text-blue-950">
          Couleur
        </legend>
        <div className="flex flex-wrap gap-2">
          {availableColors.map((color) => {
            const isSelected = color.colorName === selectedColorName

            return (
              <button
                key={color.colorName}
                type="button"
                className={`inline-flex min-h-11 items-center gap-2 rounded-[0.95rem] border px-3 py-2 text-sm font-semibold transition ${
                  isSelected
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border-stone-200 bg-white text-blue-950 hover:border-emerald-200 hover:bg-emerald-50'
                }`}
                onClick={() => onSelectColor(color.colorName)}
              >
                <span
                  className="h-4 w-4 rounded-full border border-stone-200"
                  style={{ backgroundColor: color.colorHex ?? '#ffffff' }}
                />
                {color.colorName}
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold text-blue-950">Taille</legend>
        {selectedColorName ? (
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const isSelected = variant.id === selectedVariantId
              const isOutOfStock = variant.stockQuantity <= 0

              return (
                <button
                  key={variant.id}
                  type="button"
                  className={`inline-flex min-h-11 min-w-14 items-center justify-center rounded-[0.95rem] border px-3 py-2 text-sm font-semibold transition ${
                    isSelected
                      ? 'border-blue-950 bg-blue-950 text-white'
                      : 'border-stone-200 bg-white text-blue-950 hover:border-emerald-200 hover:bg-emerald-50'
                  } disabled:cursor-not-allowed disabled:border-stone-200 disabled:bg-stone-100 disabled:text-stone-400`}
                  disabled={isOutOfStock}
                  onClick={() => onSelectVariant(variant)}
                >
                  {variant.sizeLabel}
                </button>
              )
            })}
          </div>
        ) : (
          <p className="rounded-[0.95rem] border border-stone-200 bg-white px-3 py-3 text-sm font-semibold text-stone-600">
            Choisissez une couleur pour voir les tailles.
          </p>
        )}
      </fieldset>
    </div>
  )
}

function createAvailableColors(variants: ShopProductVariant[]): AvailableColor[] {
  const colors = new Map<string, AvailableColor>()

  for (const variant of variants) {
    if (!colors.has(variant.colorName)) {
      colors.set(variant.colorName, {
        colorHex: variant.colorHex,
        colorName: variant.colorName,
      })
    }
  }

  return Array.from(colors.values())
}

function getDefaultVariant(
  variants: ShopProductVariant[],
): ShopProductVariant | null {
  return (
    variants.find((variant) => variant.isActive && variant.stockQuantity > 0) ??
    variants.find((variant) => variant.isActive) ??
    null
  )
}

function normalizeQuantityInput(value: string, maxQuantity: number): number {
  const parsedValue = Number(value)

  if (!Number.isFinite(parsedValue)) {
    return 1
  }

  return Math.min(Math.max(1, maxQuantity), Math.max(1, Math.floor(parsedValue)))
}

type StateMessageProps = {
  description: string
  title: string
  tone?: 'default' | 'error'
}

function StateMessage({
  description,
  title,
  tone = 'default',
}: StateMessageProps) {
  const className =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-stone-200 bg-stone-50 text-stone-600'

  return (
    <div className={`rounded-[1rem] border px-4 py-8 text-center ${className}`}>
      <p className="text-base font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6">{description}</p>
    </div>
  )
}
