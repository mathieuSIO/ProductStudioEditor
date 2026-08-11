import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithRouter } from '../../../test/utils/render'
import type { OrderDetails } from '../types/account.types'
import { CustomerOrderRelayPointPanel } from './CustomerOrderRelayPointPanel'

describe('CustomerOrderRelayPointPanel', () => {
  it('shows the relay selection CTA for a paid pending order', () => {
    renderPanel(createOrder({ relayPoint: createPendingRelayPoint() }))

    expect(
      screen.getByRole('heading', { name: 'Point Relais à sélectionner' }),
    ).toBeVisible()
    expect(screen.getByText(/vous devez encore choisir/i)).toBeVisible()
    expect(
      screen.getByRole('link', { name: 'Choisir mon Point Relais' }),
    ).toHaveAttribute('href', '/compte/commandes/42/relais')
  })

  it('shows official selected relay details without a selection CTA', () => {
    renderPanel(createOrder({ relayPoint: createSelectedRelayPoint() }))

    expect(
      screen.getByRole('heading', { name: 'Votre Point Relais' }),
    ).toBeVisible()
    expect(screen.getByText('Locker Le Fournil')).toBeVisible()
    expect(screen.getByText('171 route de Launaguet')).toBeVisible()
    expect(screen.getByText('31200 Toulouse')).toBeVisible()
    expect(screen.getByText('Point Relais n° 033594')).toBeVisible()
    expect(
      screen.queryByRole('link', { name: 'Choisir mon Point Relais' }),
    ).not.toBeInTheDocument()
  })

  it('shows the second address line when available', () => {
    renderPanel(createOrder({ relayPoint: createSelectedRelayPoint() }))

    expect(screen.getByText('Locker extérieur')).toBeVisible()
  })

  it('omits missing selected relay values cleanly', () => {
    const { container } = renderPanel(
      createOrder({
        relayPoint: {
          ...createSelectedRelayPoint(),
          addressLine1: null,
          addressLine2: null,
          city: null,
          name: null,
          postalCode: null,
        },
      }),
    )

    expect(screen.getByText('Point Relais n° 033594')).toBeVisible()
    expect(container).not.toHaveTextContent('null')
    expect(container).not.toHaveTextContent('undefined')
  })

  it('renders no relay block for another shipping method', () => {
    const { container } = renderPanel(
      createOrder({
        relayPoint: createSelectedRelayPoint(),
        shippingMethod: 'home',
      }),
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders safely without relay point details', () => {
    const { container } = renderPanel(createOrder({ relayPoint: null }))

    expect(container).toBeEmptyDOMElement()
  })

  it('renders no specific block when relay selection is not required', () => {
    const { container } = renderPanel(
      createOrder({
        relayPoint: {
          ...createPendingRelayPoint(),
          selectionStatus: 'not_required',
        },
      }),
    )

    expect(container).toBeEmptyDOMElement()
  })
})

function renderPanel(order: OrderDetails) {
  return renderWithRouter(<CustomerOrderRelayPointPanel order={order} />)
}

function createOrder(overrides: Partial<OrderDetails> = {}): OrderDetails {
  return {
    id: '42',
    items: [],
    relayPoint: null,
    shippingMethod: 'mondial_relay',
    status: 'paid',
    ...overrides,
  }
}

function createPendingRelayPoint(): NonNullable<OrderDetails['relayPoint']> {
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

function createSelectedRelayPoint(): NonNullable<OrderDetails['relayPoint']> {
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
