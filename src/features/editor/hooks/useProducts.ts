import { useEffect, useState } from 'react'

import { getProducts } from '../api/product.api'
import type { ProductCatalogItem } from '../types/product.types'

type UseProductsResult = {
  error: string | null
  isLoading: boolean
  products: ProductCatalogItem[]
}

function getErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return "Impossible de joindre l'API produits. Verifiez votre connexion ou la disponibilite du serveur."
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Une erreur reseau est survenue pendant le chargement des produits.'
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<ProductCatalogItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const abortController = new AbortController()

    async function loadProducts(): Promise<void> {
      setIsLoading(true)
      setError(null)

      try {
        const nextProducts = await getProducts(abortController.signal)

        if (!abortController.signal.aborted) {
          setProducts(nextProducts)
        }
      } catch (loadError) {
        if (!abortController.signal.aborted && !isAbortError(loadError)) {
          setError(getErrorMessage(loadError))
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadProducts()

    return () => {
      abortController.abort()
    }
  }, [])

  return {
    error,
    isLoading,
    products,
  }
}
