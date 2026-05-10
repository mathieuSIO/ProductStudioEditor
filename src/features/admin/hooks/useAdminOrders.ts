import { useEffect, useState } from 'react'

import { compareOrdersByCreatedAtDesc } from '../../account/utils/orderFormatters'
import { AdminOrdersApiError, fetchAdminOrders } from '../api/adminOrdersApi'
import type { AdminOrderSummary } from '../types/admin.types'

type UseAdminOrdersResult = {
  data: AdminOrderSummary[]
  error: string | null
  errorStatus: number | null
  isLoading: boolean
}

export function useAdminOrders(): UseAdminOrdersResult {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([])
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
        const adminOrders = await fetchAdminOrders()

        if (isMounted) {
          setOrders([...adminOrders].sort(compareOrdersByCreatedAtDesc))
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Les commandes admin sont indisponibles.',
          )
          setErrorStatus(
            loadError instanceof AdminOrdersApiError ? loadError.status : null,
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

