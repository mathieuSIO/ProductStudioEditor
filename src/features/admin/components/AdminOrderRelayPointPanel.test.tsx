import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { AdminOrderDetails } from '../types/admin.types'
import { AdminOrderRelayPointPanel } from './AdminOrderRelayPointPanel'

describe('AdminOrderRelayPointPanel', () => {
  it('shows a prominent operational warning for a pending relay', () => {
    renderPanel(createOrder({ relayPoint: createPendingRelayPoint() }))

    expect(screen.getByRole('heading', { name: 'Mondial Relay' })).toBeVisible()
    expect(screen.getByText('Action requise')).toBeVisible()
    expect(
      screen.getByText('Le client n’a pas encore sélectionné son Point Relais.'),
    ).toBeVisible()
    expect(screen.getByText(/ne doit pas être préparée/i)).toBeVisible()
  })

  it('shows all available selected relay fields', () => {
    renderPanel(createOrder({ relayPoint: createSelectedRelayPoint() }))

    expect(
      screen.getByRole('heading', { name: 'Point Relais Mondial Relay' }),
    ).toBeVisible()
    expect(screen.getByText('033594')).toBeVisible()
    expect(screen.getByText('Locker Le Fournil')).toBeVisible()
    expect(screen.getByText('171 route de Launaguet')).toBeVisible()
    expect(screen.getByText('Locker extérieur')).toBeVisible()
    expect(screen.getByText('31200')).toBeVisible()
    expect(screen.getByText('Toulouse')).toBeVisible()
    expect(screen.getByText('FR')).toBeVisible()
  })

  it('formats the relay selection date in Paris time', () => {
    renderPanel(createOrder({ relayPoint: createSelectedRelayPoint() }))

    expect(screen.getByText('Sélectionné le 11/08/2026 à 14:32')).toBeVisible()
  })

  it('omits the selection date when selectedAt is null', () => {
    renderPanel(
      createOrder({
        relayPoint: {
          ...createSelectedRelayPoint(),
          selectedAt: null,
        },
      }),
    )

    expect(screen.queryByText(/Sélectionné le/)).not.toBeInTheDocument()
  })

  it('omits missing selected relay fields cleanly', () => {
    const { container } = renderPanel(
      createOrder({
        relayPoint: {
          ...createSelectedRelayPoint(),
          addressLine2: null,
          city: null,
          country: null,
          name: null,
          selectedAt: null,
        },
      }),
    )

    expect(screen.getByText('033594')).toBeVisible()
    expect(container).not.toHaveTextContent('null')
    expect(container).not.toHaveTextContent('undefined')
  })

  it('renders no Mondial Relay block for another shipping method', () => {
    const { container } = renderPanel(
      createOrder({
        relayPoint: createSelectedRelayPoint(),
        shippingMethod: 'home',
      }),
    )

    expect(container).toBeEmptyDOMElement()
  })
})

function renderPanel(order: AdminOrderDetails) {
  return render(<AdminOrderRelayPointPanel order={order} />)
}

function createOrder(
  overrides: Partial<AdminOrderDetails> = {},
): AdminOrderDetails {
  return {
    id: '42',
    items: [],
    relayPoint: null,
    shippingMethod: 'mondial_relay',
    status: 'paid',
    ...overrides,
  }
}

function createPendingRelayPoint(): NonNullable<
  AdminOrderDetails['relayPoint']
> {
  return {
    addressLine1: null,
    addressLine2: null,
    city: null,
    country: null,
    id: null,
    name: null,
    postalCode: null,
    selectedAt: null,
    selectionStatus: 'pending',
  }
}

function createSelectedRelayPoint(): NonNullable<
  AdminOrderDetails['relayPoint']
> {
  return {
    addressLine1: '171 route de Launaguet',
    addressLine2: 'Locker extérieur',
    city: 'Toulouse',
    country: 'FR',
    id: '033594',
    name: 'Locker Le Fournil',
    postalCode: '31200',
    selectedAt: '2026-08-11T12:32:00.000Z',
    selectionStatus: 'selected',
  }
}
