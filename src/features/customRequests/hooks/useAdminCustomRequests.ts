import { useEffect, useState } from 'react'

import {
  CustomRequestsApiError,
  fetchAdminCustomRequests,
} from '../api/customRequestsApi'
import type { CustomRequest } from '../types'

type UseAdminCustomRequestsResult = {
  data: CustomRequest[]
  error: string | null
  errorStatus: number | null
  isLoading: boolean
}

export function useAdminCustomRequests(): UseAdminCustomRequestsResult {
  const [requests, setRequests] = useState<CustomRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorStatus, setErrorStatus] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadRequests() {
      setIsLoading(true)
      setError(null)
      setErrorStatus(null)

      try {
        const adminRequests = await fetchAdminCustomRequests()

        if (isMounted) {
          setRequests(
            [...adminRequests].sort(
              (firstRequest, secondRequest) =>
                new Date(secondRequest.createdAt).getTime() -
                new Date(firstRequest.createdAt).getTime(),
            ),
          )
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Les demandes personnalisees sont indisponibles.',
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

    void loadRequests()

    return () => {
      isMounted = false
    }
  }, [])

  return { data: requests, error, errorStatus, isLoading }
}
