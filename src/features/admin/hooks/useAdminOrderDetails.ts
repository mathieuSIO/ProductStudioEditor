import { useEffect, useState } from 'react'

import {
  AdminOrdersApiError,
  fetchAdminOrderDetails,
  updateAdminOrderShipping,
  updateAdminOrderStatus,
} from '../api/adminOrdersApi'
import type {
  AdminOrderDetails,
  AdminOrderStatus,
  UpdateAdminOrderShippingPayload,
} from '../types/admin.types'

type UseAdminOrderDetailsResult = {
  data: AdminOrderDetails | null
  error: string | null
  errorStatus: number | null
  isLoading: boolean
  isUpdatingShipping: boolean
  isUpdatingStatus: boolean
  shippingError: string | null
  shippingSuccess: string | null
  updateShipping: (payload: UpdateAdminOrderShippingPayload) => Promise<void>
  statusError: string | null
  updateStatus: (status: AdminOrderStatus) => Promise<void>
}

export function useAdminOrderDetails(
  orderId: string | null,
): UseAdminOrderDetailsResult {
  const [order, setOrder] = useState<AdminOrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(orderId))
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isUpdatingShipping, setIsUpdatingShipping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [shippingError, setShippingError] = useState<string | null>(null)
  const [shippingSuccess, setShippingSuccess] = useState<string | null>(null)
  const [errorStatus, setErrorStatus] = useState<number | null>(null)

  useEffect(() => {
    if (!orderId) {
      setOrder(null)
      setIsLoading(false)
      setError(null)
      setStatusError(null)
      setShippingError(null)
      setShippingSuccess(null)
      setErrorStatus(null)
      return
    }

    let isMounted = true
    const requestedOrderId = orderId

    async function loadOrderDetails() {
      setIsLoading(true)
      setError(null)
      setStatusError(null)
      setShippingError(null)
      setShippingSuccess(null)
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
              : 'Le détail admin de la commande est indisponible.',
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
          : 'Le statut de la commande n’a pas pu être mis à jour.',
      )
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  async function updateShipping(
    payload: UpdateAdminOrderShippingPayload,
  ): Promise<void> {
    if (!orderId) {
      return
    }

    setIsUpdatingShipping(true)
    setShippingError(null)
    setShippingSuccess(null)

    try {
      const updatedOrder = await updateAdminOrderShipping(orderId, payload)

      setOrder(updatedOrder)
      setShippingSuccess('Les informations de livraison ont ete mises a jour.')
    } catch (updateError) {
      setShippingError(
        updateError instanceof Error
          ? updateError.message
          : "Les informations de livraison n'ont pas pu etre mises a jour.",
      )
    } finally {
      setIsUpdatingShipping(false)
    }
  }

  return {
    data: order,
    error,
    errorStatus,
    isLoading,
    isUpdatingShipping,
    isUpdatingStatus,
    shippingError,
    shippingSuccess,
    statusError,
    updateShipping,
    updateStatus,
  }
}
