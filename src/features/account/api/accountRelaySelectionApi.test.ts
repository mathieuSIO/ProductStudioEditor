import { describe, expect, it } from 'vitest'

import { apiBaseUrl } from '../../../test/fixtures/api'
import { mockFetchJson } from '../../../test/utils/http'
import {
  fetchMyOrderRelaySelection,
  selectMyOrderRelayPoint,
} from './accountRelaySelectionApi'

describe('accountRelaySelectionApi', () => {
  it('fetches the authenticated relay selection for the requested order', async () => {
    localStorage.setItem('mpm.auth.token', 'account-token')
    const fetchMock = mockFetchJson({
      data: createSelectedDetails(),
      success: true,
    })

    await expect(fetchMyOrderRelaySelection(42)).resolves.toEqual(
      createSelectedDetails(),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      `${apiBaseUrl}/api/me/orders/42/relay-selection`,
      {
        headers: { Authorization: 'Bearer account-token' },
        method: 'GET',
      },
    )
  })

  it('patches only the relay id and country with existing authentication', async () => {
    localStorage.setItem('mpm.auth.token', 'account-token')
    const fetchMock = mockFetchJson({ success: true })

    await selectMyOrderRelayPoint(42, {
      country: 'FR',
      id: '033594',
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [, request] = fetchMock.mock.calls[0]
    const parsedBody: unknown = JSON.parse(String(request?.body))

    expect(fetchMock).toHaveBeenCalledWith(
      `${apiBaseUrl}/api/me/orders/42/relay-point`,
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer account-token',
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
      }),
    )
    expect(parsedBody).toEqual({
      relayPoint: {
        country: 'FR',
        id: '033594',
      },
    })
    expect(JSON.stringify(parsedBody)).not.toMatch(
      /checkoutSessionId|name|address|city|postalCode|latitude|longitude|coordinates/,
    )
  })
})

function createSelectedDetails() {
  return {
    orderId: 42,
    orderStatus: 'paid',
    paymentStatus: 'paid',
    relayPoint: {
      addressLine1: '10 rue du Relais',
      addressLine2: null,
      city: 'Paris',
      country: 'FR',
      id: '033594',
      latitude: 48.86,
      longitude: 2.35,
      name: 'Relais officiel',
      postalCode: '75001',
    },
    relaySelectionStatus: 'selected' as const,
    shippingMethod: 'mondial_relay',
  }
}
