import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { AppShell } from '../../components/layout/AppShell'
import { formatEuro } from '../../shared/formatters/formatEuro'
import {
  fetchShopProductBySlug,
  ShopProductImage,
  type ShopProduct,
} from '../../features/shop'

export function ShopProductPage() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const [product, setProduct] = useState<ShopProduct | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        setProduct(loadedProduct)
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
                {formatEuro(product.priceCents / 100)}
              </p>
              {!product.isActive ? (
                <p className="mt-3 rounded-[0.95rem] border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-600">
                  Produit actuellement indisponible.
                </p>
              ) : null}
              <button
                type="button"
                className="mt-5 inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-[1rem] bg-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-600"
                disabled
              >
                Ajout panier bientot disponible
              </button>
            </div>
          </div>
        )}
      </section>
    </AppShell>
  )
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
