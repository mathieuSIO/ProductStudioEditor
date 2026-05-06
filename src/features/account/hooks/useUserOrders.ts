import { useEffect, useState } from 'react'

import { AccountApiError, fetchUserOrders } from '../api/accountApi'
import type { OrderSummary } from '../types/account.types'
import { compareOrdersByCreatedAtDesc } from '../utils/orderFormatters'

type UseUserOrdersResult = {
  data: OrderSummary[]
  error: string | null
  errorStatus: number | null
  isLoading: boolean
}

export function useUserOrders(): UseUserOrdersResult {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorStatus, setErrorStatus] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadOrders() {
      setIsLoading(true)
      setError(null)
      setErrorStatus(null)

      try {
        const userOrders = await fetchUserOrders()

        if (isMounted) {
          setOrders([...userOrders].sort(compareOrdersByCreatedAtDesc))
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Les commandes sont indisponibles.',
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

    void loadOrders()

    return () => {
      isMounted = false
    }
  }, [])

  return { data: orders, error, errorStatus, isLoading }
}
