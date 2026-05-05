import { useEffect, useState } from 'react'

import { fetchUserOrders } from '../api/accountApi'
import type { OrderSummary } from '../types/account.types'

type UseUserOrdersResult = {
  data: OrderSummary[]
  error: string | null
  isLoading: boolean
}

export function useUserOrders(): UseUserOrdersResult {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadOrders() {
      setIsLoading(true)
      setError(null)

      try {
        const userOrders = await fetchUserOrders()

        if (isMounted) {
          setOrders(userOrders)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Les commandes sont indisponibles.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadOrders()

    return () => {
      isMounted = false
    }
  }, [])

  return { data: orders, error, isLoading }
}
