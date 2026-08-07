import { describe, expect, it } from 'vitest'

import { apiBaseUrl } from '../../../test/fixtures/api'
import { mockFetchJson } from '../../../test/utils/http'
import { fetchRelaySelection, selectRelayPoint } from './relaySelectionApi'

const selectedRelayPoint = {
  addressLine1: '10 rue de la Paix',
  addressLine2: null,
  city: 'Lille',
  country: 'FR',
  id: '033594',
  latitude: 50.6292,
  longitude: 3.0573,
  name: 'LOCKER LILLE CENTRE',
  postalCode: '59000',
}

describe('relaySelectionApi', () => {
  it('fetches and validates the relay selection contract', async () => {
    const fetchMock = mockFetchJson({
      data: {
        orderId: 42,
        orderStatus: 'paid',
        paymentStatus: 'paid',
        relayPoint: selectedRelayPoint,
        relaySelectionStatus: 'selected',
        shippingMethod: 'mondial_relay',
      },
      success: true,
    })

    const details = await fetchRelaySelection('cs test/42')

    expect(fetchMock).toHaveBeenCalledWith(
      `${apiBaseUrl}/api/orders/relay-selection?checkoutSessionId=cs%20test%2F42`,
      { headers: {}, method: 'GET' },
    )
    expect(details.relayPoint).toEqual(selectedRelayPoint)
  })

  it('sends only checkoutSessionId, relay id and country in the PATCH body', async () => {
    const fetchMock = mockFetchJson({ success: true })

    await selectRelayPoint({
      checkoutSessionId: 'cs_test_42',
      relayPoint: { country: 'FR', id: '033594' },
    })

    expect(fetchMock).toHaveBeenCalledWith(
      `${apiBaseUrl}/api/orders/relay-point`,
      {
        body: JSON.stringify({
          checkoutSessionId: 'cs_test_42',
          relayPoint: { country: 'FR', id: '033594' },
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      },
    )
  })

  it('surfaces success:false API responses', async () => {
    mockFetchJson(
      { message: 'Commande introuvable.', success: false },
      { status: 404 },
    )

    await expect(fetchRelaySelection('cs_missing')).rejects.toThrow(
      'Commande introuvable.',
    )
  })

  it('rejects a backend response that differs from the documented contract', async () => {
    mockFetchJson({
      data: {
        order_id: 42,
        payment_status: 'paid',
        relay_selection_status: 'pending',
      },
      success: true,
    })

    await expect(fetchRelaySelection('cs_invalid')).rejects.toThrow(
      'ne respecte pas le contrat attendu',
    )
  })
})
