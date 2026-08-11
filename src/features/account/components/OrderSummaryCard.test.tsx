import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithRouter } from '../../../test/utils/render'
import type { CustomerOrderSummary } from '../types/account.types'
import { OrderSummaryCard } from './OrderSummaryCard'

const paidRelayOrder: CustomerOrderSummary = {
  createdAt: '2026-08-11T10:00:00.000Z',
  id: '42',
  orderNumber: 'MPM-42',
  relaySelectionStatus: 'pending',
  shippingMethod: 'mondial_relay',
  status: 'paid',
  totalCents: 5600,
}

describe('OrderSummaryCard Mondial Relay status', () => {
  it('shows the required action and correct relay selection link', () => {
    renderOrder(paidRelayOrder)

    expect(screen.getByText('Action requise')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Choisissez votre Point Relais pour permettre l’expédition de votre commande.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Choisir mon Point Relais' }),
    ).toHaveAttribute('href', '/compte/commandes/42/relais')
  })

  it('shows the selected relay indicator without a CTA', () => {
    renderOrder({
      ...paidRelayOrder,
      relaySelectionStatus: 'selected',
    })

    expect(screen.getByText('Point Relais sélectionné')).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Choisir mon Point Relais' }),
    ).toBeNull()
  })

  it('shows no relay state for another shipping method', () => {
    renderOrder({
      ...paidRelayOrder,
      shippingMethod: 'standard',
    })

    expect(screen.queryByText('Action requise')).toBeNull()
    expect(screen.queryByText('Point Relais sélectionné')).toBeNull()
  })

  it('shows no relay state when selection is not required', () => {
    renderOrder({
      ...paidRelayOrder,
      relaySelectionStatus: 'not_required',
    })

    expect(screen.queryByText('Action requise')).toBeNull()
    expect(screen.queryByText('Point Relais sélectionné')).toBeNull()
  })

  it('does not request an action for an unpaid order', () => {
    renderOrder({
      ...paidRelayOrder,
      status: 'pending',
    })

    expect(screen.queryByText('Action requise')).toBeNull()
    expect(
      screen.queryByRole('link', { name: 'Choisir mon Point Relais' }),
    ).toBeNull()
  })

  it('renders safely when relay fields are null', () => {
    renderOrder({
      ...paidRelayOrder,
      relaySelectionStatus: null,
      shippingMethod: null,
    })

    expect(screen.getByText('MPM-42')).toBeInTheDocument()
    expect(screen.queryByText('Action requise')).toBeNull()
    expect(screen.queryByText('Point Relais sélectionné')).toBeNull()
  })
})

function renderOrder(order: CustomerOrderSummary) {
  return renderWithRouter(
    <OrderSummaryCard onSelectOrder={vi.fn()} order={order} />,
  )
}
