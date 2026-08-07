import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  MondialRelaySelection,
  RelaySelectionDetails,
} from '../../features/checkout'
import { renderWithRouter } from '../../test/utils/render'
import { CheckoutSuccessPage } from './CheckoutSuccessPage'

const apiMocks = vi.hoisted(() => ({
  fetchRelaySelection: vi.fn(),
  fetchUserOrderDetails: vi.fn(),
  selectRelayPoint: vi.fn(),
}))

vi.mock('../../features/account/api/accountApi', () => ({
  fetchUserOrderDetails: apiMocks.fetchUserOrderDetails,
}))

vi.mock('../../features/checkout', () => ({
  fetchRelaySelection: apiMocks.fetchRelaySelection,
  MondialRelayPicker: ({
    disabled,
    onSelect,
  }: {
    disabled?: boolean
    onSelect: (selection: MondialRelaySelection) => void
  }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect({ country: 'FR', id: '033594' })}
    >
      Sélectionner le relais test
    </button>
  ),
  pendingCheckoutCustomerFirstNameStorageKey:
    'pendingCheckoutCustomerFirstName',
  pendingCheckoutOrderIdStorageKey: 'pendingOrderId',
  selectRelayPoint: apiMocks.selectRelayPoint,
}))

const pendingDetails: RelaySelectionDetails = {
  orderId: 42,
  orderStatus: 'pending',
  paymentStatus: 'pending',
  relayPoint: null,
  relaySelectionStatus: 'pending',
  shippingMethod: 'mondial_relay',
}

const paidRelayPendingDetails: RelaySelectionDetails = {
  ...pendingDetails,
  orderStatus: 'paid',
  paymentStatus: 'paid',
}

const selectedDetails: RelaySelectionDetails = {
  ...paidRelayPendingDetails,
  relayPoint: {
    addressLine1: '10 rue Officielle',
    addressLine2: 'Bâtiment B',
    city: 'Lille',
    country: 'FR',
    id: '033594',
    latitude: 50.6292,
    longitude: 3.0573,
    name: 'LOCKER OFFICIEL BACKEND',
    postalCode: '59000',
  },
  relaySelectionStatus: 'selected',
}

describe('CheckoutSuccessPage relay selection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not call the relay API when session_id is absent', () => {
    renderCheckoutSuccess('/checkout/success')

    expect(apiMocks.fetchRelaySelection).not.toHaveBeenCalled()
    expect(screen.getByText('Commande à vérifier')).toBeInTheDocument()
  })

  it('shows the payment waiting message while payment is pending', async () => {
    apiMocks.fetchRelaySelection.mockResolvedValue(pendingDetails)

    renderCheckoutSuccess()

    expect(
      await screen.findByText('Confirmation de votre paiement en cours…'),
    ).toBeInTheDocument()
  })

  it('retries a pending payment after the configured delay', async () => {
    vi.useFakeTimers()
    apiMocks.fetchRelaySelection.mockResolvedValue(pendingDetails)

    renderCheckoutSuccess()
    await act(async () => undefined)
    expect(apiMocks.fetchRelaySelection).toHaveBeenCalledTimes(1)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    expect(apiMocks.fetchRelaySelection).toHaveBeenCalledTimes(2)
  })

  it('shows the Mondial Relay area for a paid order awaiting selection', async () => {
    apiMocks.fetchRelaySelection.mockResolvedValue(paidRelayPendingDetails)

    renderCheckoutSuccess()

    expect(
      await screen.findByRole('heading', {
        name: 'Choisissez votre Point Relais',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Sélectionner le relais test' }),
    ).toBeInTheDocument()
  })

  it('sends the exact minimal PATCH payload selected by the widget', async () => {
    apiMocks.fetchRelaySelection
      .mockResolvedValueOnce(paidRelayPendingDetails)
      .mockResolvedValueOnce(selectedDetails)
    apiMocks.selectRelayPoint.mockResolvedValue(undefined)

    renderCheckoutSuccess()
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Sélectionner le relais test',
      }),
    )

    await waitFor(() =>
      expect(apiMocks.selectRelayPoint).toHaveBeenCalledWith({
        checkoutSessionId: 'cs_test_42',
        relayPoint: { country: 'FR', id: '033594' },
      }),
    )

    const payload = apiMocks.selectRelayPoint.mock.calls[0]?.[0]
    expect(JSON.stringify(payload)).not.toMatch(
      /name|address|postalCode|city|latitude|longitude|coordinates/,
    )
  })

  it('refetches GET after a successful PATCH and displays official backend data', async () => {
    apiMocks.fetchRelaySelection
      .mockResolvedValueOnce(paidRelayPendingDetails)
      .mockResolvedValueOnce(selectedDetails)
    apiMocks.selectRelayPoint.mockResolvedValue(undefined)

    renderCheckoutSuccess()
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Sélectionner le relais test',
      }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Votre Point Relais' }),
    ).toBeInTheDocument()
    expect(apiMocks.fetchRelaySelection).toHaveBeenCalledTimes(2)
    expect(screen.getByText('LOCKER OFFICIEL BACKEND')).toBeInTheDocument()
    expect(screen.getByText('10 rue Officielle')).toBeInTheDocument()
    expect(screen.getByText('59000 Lille')).toBeInTheDocument()
  })

  it('renders official relay details directly when already selected', async () => {
    apiMocks.fetchRelaySelection.mockResolvedValue(selectedDetails)

    renderCheckoutSuccess()

    expect(
      await screen.findByText('LOCKER OFFICIEL BACKEND'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Sélectionner le relais test' }),
    ).toBeNull()
  })

  it('ignores a duplicate widget callback while PATCH is in flight', async () => {
    let resolvePatch: (() => void) | undefined
    apiMocks.fetchRelaySelection
      .mockResolvedValueOnce(paidRelayPendingDetails)
      .mockResolvedValueOnce(selectedDetails)
    apiMocks.selectRelayPoint.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolvePatch = resolve
        }),
    )

    renderCheckoutSuccess()
    const selectButton = await screen.findByRole('button', {
      name: 'Sélectionner le relais test',
    })

    fireEvent.click(selectButton)
    fireEvent.click(selectButton)
    expect(apiMocks.selectRelayPoint).toHaveBeenCalledTimes(1)

    resolvePatch?.()
    await screen.findByText('LOCKER OFFICIEL BACKEND')
  })

  it('recovers from an already-selected PATCH conflict by refetching official state', async () => {
    apiMocks.fetchRelaySelection
      .mockResolvedValueOnce(paidRelayPendingDetails)
      .mockResolvedValueOnce(selectedDetails)
    apiMocks.selectRelayPoint.mockRejectedValue(new Error('Already selected'))

    renderCheckoutSuccess()
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Sélectionner le relais test',
      }),
    )

    expect(
      await screen.findByText('LOCKER OFFICIEL BACKEND'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('cancels pending payment retries when unmounted', async () => {
    vi.useFakeTimers()
    apiMocks.fetchRelaySelection.mockResolvedValue(pendingDetails)

    const { unmount } = renderCheckoutSuccess()
    await act(async () => undefined)
    expect(apiMocks.fetchRelaySelection).toHaveBeenCalledTimes(1)

    unmount()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20_000)
    })

    expect(apiMocks.fetchRelaySelection).toHaveBeenCalledTimes(1)
  })

  it('keeps the classic success page when relay selection is not required', async () => {
    apiMocks.fetchRelaySelection.mockResolvedValue({
      ...paidRelayPendingDetails,
      relaySelectionStatus: 'not_required',
      shippingMethod: 'standard',
    })

    renderCheckoutSuccess()

    expect(
      await screen.findByText('Merci pour votre commande !'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', {
        name: 'Choisissez votre Point Relais',
      }),
    ).toBeNull()
  })

  it('does not show relay data for another shipping method', async () => {
    apiMocks.fetchRelaySelection.mockResolvedValue({
      ...selectedDetails,
      shippingMethod: 'standard',
    })

    renderCheckoutSuccess()

    expect(
      await screen.findByText('Merci pour votre commande !'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Votre Point Relais' }),
    ).toBeNull()
  })
})

function renderCheckoutSuccess(
  route = '/checkout/success?session_id=cs_test_42',
) {
  return renderWithRouter(<CheckoutSuccessPage />, {
    path: '/checkout/success',
    route,
  })
}
