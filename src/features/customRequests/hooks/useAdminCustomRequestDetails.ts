import { useEffect, useState } from 'react'

import {
  CustomRequestsApiError,
  fetchAdminCustomRequestDetails,
  updateAdminCustomRequestStatus,
} from '../api/customRequestsApi'
import type { CustomRequest, CustomRequestStatus } from '../types'

type UseAdminCustomRequestDetailsResult = {
  data: CustomRequest | null
  error: string | null
  errorStatus: number | null
  isLoading: boolean
  isUpdatingStatus: boolean
  statusError: string | null
  statusSuccess: string | null
  updateStatus: (status: CustomRequestStatus) => Promise<void>
}

export function useAdminCustomRequestDetails(
  requestId: string | null,
): UseAdminCustomRequestDetailsResult {
  const [request, setRequest] = useState<CustomRequest | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(requestId))
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorStatus, setErrorStatus] = useState<number | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!requestId) {
      setRequest(null)
      setIsLoading(false)
      setError(null)
      setErrorStatus(null)
      setStatusError(null)
      setStatusSuccess(null)
      return
    }

    let isMounted = true
    const requestedId = requestId

    async function loadRequest() {
      setIsLoading(true)
      setError(null)
      setErrorStatus(null)
      setStatusError(null)
      setStatusSuccess(null)

      try {
        const adminRequest = await fetchAdminCustomRequestDetails(requestedId)

        if (isMounted) {
          setRequest(adminRequest)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'La demande personnalisee est indisponible.',
          )
          setErrorStatus(
            loadError instanceof CustomRequestsApiError
              ? loadError.status
              : null,
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadRequest()

    return () => {
      isMounted = false
    }
  }, [requestId])

  async function updateStatus(status: CustomRequestStatus): Promise<void> {
    if (!requestId) {
      return
    }

    setIsUpdatingStatus(true)
    setStatusError(null)
    setStatusSuccess(null)

    try {
      const updatedRequest = await updateAdminCustomRequestStatus(requestId, {
        status,
      })

      setRequest(updatedRequest)
      setStatusSuccess('Le statut de la demande a ete mis a jour.')
    } catch (updateError) {
      setStatusError(
        updateError instanceof Error
          ? updateError.message
          : "Le statut n'a pas pu etre mis a jour.",
      )
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return {
    data: request,
    error,
    errorStatus,
    isLoading,
    isUpdatingStatus,
    statusError,
    statusSuccess,
    updateStatus,
  }
}
