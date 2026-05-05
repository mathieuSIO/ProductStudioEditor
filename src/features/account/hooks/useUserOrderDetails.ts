import { useEffect, useState } from 'react'

import { fetchUserOrderDetails } from '../api/accountApi'
import type { OrderDetails } from '../types/account.types'

type UseUserOrderDetailsResult = {
  data: OrderDetails | null
  error: string | null
  isLoading: boolean
}

export function useUserOrderDetails(
  orderId: string | null,
): UseUserOrderDetailsResult {
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(orderId))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      setOrder(null)
      setIsLoading(false)
      setError(null)
      return
    }

    let isMounted = true
    const requestedOrderId = orderId

    async function loadOrderDetails() {
      setIsLoading(true)
      setError(null)

      try {
        const userOrder = await fetchUserOrderDetails(requestedOrderId)

        if (isMounted) {
          setOrder(userOrder)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Le détail de la commande est indisponible.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadOrderDetails()

    return () => {
      isMounted = false
    }
  }, [orderId])

  return { data: order, error, isLoading }
}
