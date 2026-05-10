import { useEffect, useState } from 'react'

import {
  AdminOrdersApiError,
  fetchAdminOrderDetails,
  updateAdminOrderStatus,
} from '../api/adminOrdersApi'
import type { AdminOrderDetails, AdminOrderStatus } from '../types/admin.types'

type UseAdminOrderDetailsResult = {
  data: AdminOrderDetails | null
  error: string | null
  errorStatus: number | null
  isLoading: boolean
  isUpdatingStatus: boolean
  statusError: string | null
  updateStatus: (status: AdminOrderStatus) => Promise<void>
}

export function useAdminOrderDetails(
  orderId: string | null,
): UseAdminOrderDetailsResult {
  const [order, setOrder] = useState<AdminOrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(orderId))
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [errorStatus, setErrorStatus] = useState<number | null>(null)

  useEffect(() => {
    if (!orderId) {
      setOrder(null)
      setIsLoading(false)
      setError(null)
      setStatusError(null)
      setErrorStatus(null)
      return
    }

    let isMounted = true
    const requestedOrderId = orderId

    async function loadOrderDetails() {
      setIsLoading(true)
      setError(null)
      setStatusError(null)
      setErrorStatus(null)

      try {
        const adminOrder = await fetchAdminOrderDetails(requestedOrderId)

        if (isMounted) {
          setOrder(adminOrder)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Le detail admin de la commande est indisponible.',
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

    void loadOrderDetails()

    return () => {
      isMounted = false
    }
  }, [orderId])

  async function updateStatus(status: AdminOrderStatus): Promise<void> {
    if (!orderId) {
      return
    }

    setIsUpdatingStatus(true)
    setStatusError(null)

    try {
      const updatedOrder = await updateAdminOrderStatus(orderId, status)

      setOrder(updatedOrder)
    } catch (updateError) {
      setStatusError(
        updateError instanceof Error
          ? updateError.message
          : 'Le statut de la commande n a pas pu etre mis a jour.',
      )
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return {
    data: order,
    error,
    errorStatus,
    isLoading,
    isUpdatingStatus,
    statusError,
    updateStatus,
  }
}
