export type CustomRequestStatus = 'closed' | 'in_progress' | 'new' | 'quoted'

export type CustomRequest = {
  createdAt: string
  customerEmail: string
  customerFirstName: string | null
  customerLastName: string | null
  customerPhone: string | null
  id: number
  message: string
  status: CustomRequestStatus
  updatedAt: string
}

export type CreateCustomRequestPayload = {
  customerEmail: string
  customerFirstName?: string | null
  customerLastName?: string | null
  customerPhone?: string | null
  message: string
}

export type UpdateCustomRequestStatusPayload = {
  status: CustomRequestStatus
}

export type CustomRequestApiResponse<T> =
  | {
      data: T
      success: true
    }
  | {
      message: string
      success: false
    }
