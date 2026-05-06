import { useEffect, useState } from 'react'

import { AccountApiError, fetchUserOrderDetails } from '../api/accountApi'
import type { OrderDetails } from '../types/account.types'

type UseUserOrderDetailsResult = {
  data: OrderDetails | null
  error: string | null
  errorStatus: number | null
  isLoading: boolean
}

export function useUserOrderDetails(
  orderId: string | null,
): UseUserOrderDetailsResult {
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(orderId))
  const [error, setError] = useState<string | null>(null)
  const [errorStatus, setErrorStatus] = useState<number | null>(null)

  useEffect(() => {
    if (!orderId) {
      setOrder(null)
      setIsLoading(false)
      setError(null)
      setErrorStatus(null)
      return
    }

    let isMounted = true
    const requestedOrderId = orderId

    async function loadOrderDetails() {
      setIsLoading(true)
      setError(null)
      setErrorStatus(null)

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
          setErrorStatus(
            loadError instanceof AccountApiError ? loadError.status : null,
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

  return { data: order, error, errorStatus, isLoading }
}
