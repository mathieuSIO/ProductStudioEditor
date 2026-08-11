export type RelaySelectionStatus =
  | 'not_required'
  | 'pending'
  | 'selected'

export type RelayPoint = {
  id: string
  name: string
  addressLine1: string
  addressLine2: string | null
  postalCode: string
  city: string
  country: string
  latitude: number | null
  longitude: number | null
}

export type RelaySelectionDetails = {
  orderId: number
  orderStatus: string
  paymentStatus: string
  shippingMethod: string
  relaySelectionStatus: RelaySelectionStatus
  relayPoint: RelayPoint | null
}

export type RelayPointSelection = {
  id: string
  country: string
}
