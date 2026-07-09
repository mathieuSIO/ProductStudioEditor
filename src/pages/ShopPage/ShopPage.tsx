import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import boutiqueLogoUrl from '../../assets/images/boutique/boutiqueLogo.png'
import { AppShell } from '../../components/layout/AppShell'
import { HeaderCartButton, useCart } from '../../features/cart'
import { fetchShopProducts, ShopProductCard, type ShopProduct } from '../../features/shop'

export function ShopPage() {
  const navigate = useNavigate()
  const { itemCount } = useCart()
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const abortController = new AbortController()

    async function loadProducts() {
      setIsLoading(true)
      setError(null)

      try {
        const loadedProducts = await fetchShopProducts(abortController.signal)
        setProducts(loadedProducts)
      } catch (loadError) {
        if (abortController.signal.aborted) {
          return
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Impossible de charger les produits boutique.',
        )
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadProducts()

    return () => abortController.abort()
  }, [])

  return (
    <AppShell
      title=""
      subtitle=""
      secondaryLogo={{
        alt: 'Logo Boutique Mon Petit Matos',
        src: boutiqueLogoUrl,
      }}
      action={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-[1rem] border border-blue-100 bg-white px-4 py-2.5 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            onClick={() => navigate('/')}
          >
            Studio
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-[1rem] border border-blue-100 bg-white px-4 py-2.5 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            onClick={() => navigate('/account/profile')}
          >
            Mon Compte
          </button>
          <HeaderCartButton
            itemCount={itemCount}
            onClick={() => navigate('/?view=cart')}
          />
        </div>
      }
      onReturnToStudio={() => navigate('/')}
    >
      <section className="grid gap-5 rounded-[1.35rem] border border-stone-200 bg-white px-4 py-5 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.28)] sm:px-5">
        <div className="max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Boutique MPM
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">
            Boutique
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Decouvrez nos produits prets a porter et creations Mon Petit Matos.
          </p>
        </div>

        {isLoading ? (
          <StateMessage
            title="Chargement de la boutique"
            description="Recuperation des produits disponibles."
          />
        ) : error ? (
          <StateMessage
            title="Boutique indisponible"
            description="Impossible de charger les produits boutique."
            tone="error"
          />
        ) : products.length === 0 ? (
          <StateMessage
            title="Aucun produit disponible"
            description="Les prochaines creations Mon Petit Matos apparaitront ici."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ShopProductCard key={product.id} product={product} />
            ))}
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
