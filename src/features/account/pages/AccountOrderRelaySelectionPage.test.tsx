import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  RelayPointSelection,
  RelaySelectionDetails,
} from '../../../shared/types/relay'
import { renderWithRouter } from '../../../test/utils/render'
import { AccountApiError } from '../api/accountApi'
import { AccountOrderRelaySelectionPage } from './AccountOrderRelaySelectionPage'

const apiMocks = vi.hoisted(() => ({
  fetchMyOrderRelaySelection: vi.fn(),
  selectMyOrderRelayPoint: vi.fn(),
}))

type MockPickerProps = {
  disabled?: boolean
  onSelect: (selection: RelayPointSelection) => void
}

vi.mock('../api/accountRelaySelectionApi', () => apiMocks)

vi.mock('../../checkout', async () => {
  const React = await import('react')

  return {
    MondialRelayPicker: ({ disabled, onSelect }: MockPickerProps) =>
      React.createElement(
        'div',
        { 'data-testid': 'mondial-relay-picker' },
        React.createElement(
          'button',
          {
            disabled,
            onClick: () => onSelect({ country: 'BE', id: '111111' }),
            type: 'button',
          },
          'Sélectionner A',
        ),
        React.createElement(
          'button',
          {
            disabled,
            onClick: () => onSelect({ country: 'FR', id: '033594' }),
            type: 'button',
          },
          'Sélectionner B',
        ),
      ),
  }
})

describe('AccountOrderRelaySelectionPage', () => {
  beforeEach(() => {
    apiMocks.fetchMyOrderRelaySelection.mockReset()
    apiMocks.selectMyOrderRelayPoint.mockReset()
    apiMocks.fetchMyOrderRelaySelection.mockResolvedValue(createPendingDetails())
    apiMocks.selectMyOrderRelayPoint.mockResolvedValue(undefined)
  })

  it('shows the existing picker for a paid order awaiting a relay', async () => {
    renderPage()

    expect(
      await screen.findByRole('heading', {
        name: 'Choisissez votre Point Relais',
      }),
    ).toBeVisible()
    expect(screen.getByTestId('mondial-relay-picker')).toBeVisible()
  })

  it('keeps a picker selection local without patching immediately', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Sélectionner B' }))

    expect(apiMocks.selectMyOrderRelayPoint).not.toHaveBeenCalled()
  })

  it('enables explicit confirmation after a local selection', async () => {
    const user = userEvent.setup()
    renderPage()

    const confirmButton = await screen.findByRole('button', {
      name: 'Valider ce Point Relais',
    })
    expect(confirmButton).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Sélectionner B' }))

    expect(confirmButton).toBeEnabled()
    expect(
      screen.getByText(
        'Un Point Relais a été sélectionné. Validez votre choix pour continuer.',
      ),
    ).toBeVisible()
  })

  it('replaces local selection and sends only the last choice on confirmation', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Sélectionner A' }))
    await user.click(screen.getByRole('button', { name: 'Sélectionner B' }))
    expect(apiMocks.selectMyOrderRelayPoint).not.toHaveBeenCalled()

    await user.click(
      screen.getByRole('button', { name: 'Valider ce Point Relais' }),
    )

    expect(apiMocks.selectMyOrderRelayPoint).toHaveBeenCalledWith(42, {
      country: 'FR',
      id: '033594',
    })
  })

  it('prevents a second patch while confirmation is in progress', async () => {
    const user = userEvent.setup()
    const patchRequest = createDeferred<void>()
    apiMocks.selectMyOrderRelayPoint.mockReturnValue(patchRequest.promise)
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Sélectionner B' }))
    const confirmButton = screen.getByRole('button', {
      name: 'Valider ce Point Relais',
    })
    fireEvent.click(confirmButton)
    fireEvent.click(confirmButton)

    expect(apiMocks.selectMyOrderRelayPoint).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Enregistrement du Point Relais…')).toBeVisible()

    patchRequest.resolve()
  })

  it('refetches official details after a successful patch', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Sélectionner B' }))
    await user.click(
      screen.getByRole('button', { name: 'Valider ce Point Relais' }),
    )

    expect(apiMocks.fetchMyOrderRelaySelection).toHaveBeenCalledTimes(2)
  })

  it('replaces the picker with official backend data after confirmation', async () => {
    const user = userEvent.setup()
    apiMocks.fetchMyOrderRelaySelection
      .mockResolvedValueOnce(createPendingDetails())
      .mockResolvedValueOnce(createSelectedDetails())
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Sélectionner B' }))
    await user.click(
      screen.getByRole('button', { name: 'Valider ce Point Relais' }),
    )

    expect(await screen.findByText('Relais officiel backend')).toBeVisible()
    expect(screen.getByText('10 rue du Backend')).toBeVisible()
    expect(screen.queryByTestId('mondial-relay-picker')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Valider ce Point Relais' }),
    ).not.toBeInTheDocument()
  })

  it('never shows the picker when initial backend state is selected', async () => {
    apiMocks.fetchMyOrderRelaySelection.mockResolvedValue(createSelectedDetails())
    renderPage()

    expect(await screen.findByText('Relais officiel backend')).toBeVisible()
    expect(screen.getByText('75001 Paris')).toBeVisible()
    expect(screen.queryByTestId('mondial-relay-picker')).not.toBeInTheDocument()
  })

  it('keeps the local selection and allows retry when patch fails', async () => {
    const user = userEvent.setup()
    apiMocks.selectMyOrderRelayPoint.mockRejectedValue(new Error('failure'))
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Sélectionner B' }))
    await user.click(
      screen.getByRole('button', { name: 'Valider ce Point Relais' }),
    )

    expect(
      await screen.findByText(
        'Votre Point Relais n’a pas pu être enregistré. Veuillez réessayer.',
      ),
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Valider ce Point Relais' }),
    ).toBeEnabled()
  })

  it('shows a non-error state when relay selection is not required', async () => {
    apiMocks.fetchMyOrderRelaySelection.mockResolvedValue({
      ...createPendingDetails(),
      relaySelectionStatus: 'not_required',
    })
    renderPage()

    expect(await screen.findByText('Aucune sélection nécessaire')).toBeVisible()
    expect(screen.queryByTestId('mondial-relay-picker')).not.toBeInTheDocument()
  })

  it('does not show the picker before payment is confirmed', async () => {
    apiMocks.fetchMyOrderRelaySelection.mockResolvedValue({
      ...createPendingDetails(),
      orderStatus: 'pending',
      paymentStatus: 'pending',
    })
    renderPage()

    expect(
      await screen.findByText(
        'La sélection du Point Relais sera disponible une fois le paiement confirmé.',
      ),
    ).toBeVisible()
    expect(screen.queryByTestId('mondial-relay-picker')).not.toBeInTheDocument()
  })

  it('shows the same not-found state for an inaccessible order', async () => {
    apiMocks.fetchMyOrderRelaySelection.mockRejectedValue(
      new AccountApiError('Not found', 404),
    )
    renderPage()

    expect(await screen.findByText('Cette commande est introuvable.')).toBeVisible()
    expect(screen.queryByTestId('mondial-relay-picker')).not.toBeInTheDocument()
  })

  it('retries only the GET after a temporary loading error', async () => {
    const user = userEvent.setup()
    apiMocks.fetchMyOrderRelaySelection
      .mockRejectedValueOnce(new AccountApiError('Unavailable', 503))
      .mockResolvedValueOnce(createPendingDetails())
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Réessayer' }))

    expect(apiMocks.fetchMyOrderRelaySelection).toHaveBeenCalledTimes(2)
    expect(apiMocks.selectMyOrderRelayPoint).not.toHaveBeenCalled()
    expect(await screen.findByTestId('mondial-relay-picker')).toBeVisible()
  })

  it('does not call the backend for an invalid URL order id', async () => {
    renderPage('/compte/commandes/invalide/relais')

    expect(await screen.findByText('Cette commande est introuvable.')).toBeVisible()
    expect(apiMocks.fetchMyOrderRelaySelection).not.toHaveBeenCalled()
  })

  it('restores selected state from the backend on a fresh render', async () => {
    apiMocks.fetchMyOrderRelaySelection.mockResolvedValue(createSelectedDetails())
    const firstRender = renderPage()

    expect(await screen.findByText('Relais officiel backend')).toBeVisible()
    firstRender.unmount()
    renderPage()

    expect(await screen.findByText('Relais officiel backend')).toBeVisible()
    expect(apiMocks.fetchMyOrderRelaySelection).toHaveBeenCalledTimes(2)
    expect(apiMocks.selectMyOrderRelayPoint).not.toHaveBeenCalled()
  })

  it('uses selected official state when another tab already confirmed it', async () => {
    const user = userEvent.setup()
    apiMocks.selectMyOrderRelayPoint.mockRejectedValue(
      new AccountApiError('Conflict', 409),
    )
    apiMocks.fetchMyOrderRelaySelection
      .mockResolvedValueOnce(createPendingDetails())
      .mockResolvedValueOnce(createSelectedDetails())
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Sélectionner B' }))
    await user.click(
      screen.getByRole('button', { name: 'Valider ce Point Relais' }),
    )

    expect(await screen.findByText('Relais officiel backend')).toBeVisible()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

function renderPage(route = '/compte/commandes/42/relais') {
  return renderWithRouter(<AccountOrderRelaySelectionPage />, {
    path: '/compte/commandes/:orderId/relais',
    route,
  })
}

function createPendingDetails(): RelaySelectionDetails {
  return {
    orderId: 42,
    orderStatus: 'paid',
    paymentStatus: 'paid',
    relayPoint: null,
    relaySelectionStatus: 'pending',
    shippingMethod: 'mondial_relay',
  }
}

function createSelectedDetails(): RelaySelectionDetails {
  return {
    ...createPendingDetails(),
    relayPoint: {
      addressLine1: '10 rue du Backend',
      addressLine2: null,
      city: 'Paris',
      country: 'FR',
      id: '033594',
      latitude: 48.86,
      longitude: 2.35,
      name: 'Relais officiel backend',
      postalCode: '75001',
    },
    relaySelectionStatus: 'selected',
  }
}

function createDeferred<T>() {
  let resolvePromise: (value: T | PromiseLike<T>) => void = () => undefined
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve
  })

  return { promise, resolve: resolvePromise }
}
