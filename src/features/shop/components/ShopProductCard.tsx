import { Link } from 'react-router-dom'

import { formatEuro } from '../../../shared/formatters/formatEuro'
import type { ShopProduct, ShopProductVariant } from '../types/shop.types'
import { ShopProductImage } from './ShopProductImage'

const MAX_VISIBLE_COLORS = 6

type ShopProductCardProps = {
  product: ShopProduct
}

export function ShopProductCard({ product }: ShopProductCardProps) {
  const availableColors = getProductColors(product)
  const visibleColors = availableColors.slice(0, MAX_VISIBLE_COLORS)
  const hiddenColorCount = availableColors.length - visibleColors.length

  return (
    <article className="flex h-full flex-col rounded-[1.15rem] border border-stone-200 bg-white p-3 shadow-[0_18px_42px_-38px_rgba(15,23,42,0.35)]">
      <ShopProductImage imageUrl={product.imageUrl} name={product.name} />
      <div className="flex flex-col px-1 pb-1 pt-4 whitespace-pre-line">
        <h2 className="text-lg font-semibold tracking-tight text-blue-950">
          {product.name}
        </h2>
        {product.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-5 text-stone-600 whitespace-pre-line">
            {product.description}
          </p>
        ) : null}
        {availableColors.length > 0 ? (
          <div
            className="mt-3 flex flex-wrap items-center gap-1.5"
            aria-label="Couleurs disponibles"
          >
            {visibleColors.map((color) => (
              <span
                key={color.name}
                className="h-4 w-4 rounded-full border border-stone-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)]"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {hiddenColorCount > 0 ? (
              <span
                className="ml-0.5 text-xs font-semibold text-stone-500"
                title={`${hiddenColorCount} couleur${hiddenColorCount > 1 ? 's' : ''} supplementaire${hiddenColorCount > 1 ? 's' : ''}`}
              >
                +{hiddenColorCount}
              </span>
            ) : null}
          </div>
        ) : null}
        <p className="mt-3 text-xl font-semibold tracking-tight text-red-600">
          {formatEuro(product.priceCents / 100)}
        </p>
        <Link
          className="mt-3 inline-flex min-h-11 items-center justify-center rounded-[1rem] bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          to={`/boutique/${product.slug}`}
        >
          Voir le produit
        </Link>
      </div>
    </article>
  )
}

type AvailableProductColor = {
  hex: string
  name: string
}

function getProductColors(product: ShopProduct): AvailableProductColor[] {
  const colors = new Map<string, AvailableProductColor>()

  for (const variant of product.variants) {
    addProductColor(colors, variant)
  }

  return Array.from(colors.values())
}

function addProductColor(
  colors: Map<string, AvailableProductColor>,
  variant: ShopProductVariant,
) {
  if (!variant.isActive) {
    return
  }

  const normalizedColorName = normalizeColorName(variant.colorName)

  if (colors.has(normalizedColorName)) {
    return
  }

  colors.set(normalizedColorName, {
    hex: variant.colorHex ?? getFallbackColorHex(variant.colorName),
    name: variant.colorName,
  })
}

function getFallbackColorHex(colorName: string): string {
  const normalizedColorName = normalizeColorName(colorName)
  const colorMap: Record<string, string> = {
    beige: '#d7c0a3',
    blanc: '#ffffff',
    bleu: '#2563eb',
    blue: '#2563eb',
    gris: '#9ca3af',
    grey: '#9ca3af',
    gray: '#9ca3af',
    marine: '#1e3a8a',
    navy: '#1e3a8a',
    noir: '#111111',
    red: '#dc2626',
    rouge: '#dc2626',
    white: '#ffffff',
    black: '#111111',
  }

  return colorMap[normalizedColorName] ?? '#d1d5db'
}

function normalizeColorName(colorName: string): string {
  return colorName
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
