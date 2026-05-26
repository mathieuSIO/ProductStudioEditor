export type AuthUser = {
  id: number
  email: string
  firstName: string
  lastName: string
  role?: string
  phone: string | null
  addressLine1: string | null
  addressLine2: string | null
  postalCode: string | null
  city: string | null
  country: string
}

export type AuthSession = {
  token: string
  user: AuthUser
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  email: string
  firstName: string
  lastName: string
  password: string
}

export type ForgotPasswordPayload = {
  email: string
}

export type ResetPasswordPayload = {
  password: string
  token: string
}

export type AuthApiResponse<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      message: string
    }

export type AuthMessageApiResponse =
  | {
      message: string
      success: true
    }
  | {
      message: string
      success: false
    }
