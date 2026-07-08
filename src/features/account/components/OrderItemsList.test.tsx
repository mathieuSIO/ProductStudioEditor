import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { OrderItemDetails } from '../types/account.types'
import { OrderItemsList } from './OrderItemsList'

const shopItem: OrderItemDetails = {
  id: 'shop-item',
  itemType: 'shop',
  productName: 'T-shirt boutique',
  quantity: 2,
  shopProductId: 10,
  shopProductVariantId: 20,
  totalPriceCents: 5000,
  unitPriceCents: 2500,
  variantColorHex: '#ffffff',
  variantColorName: 'Blanc',
  variantImageUrl: '/uploads/variants/white-m.png',
  variantSizeLabel: 'M',
  variantSku: 'TSHIRT-WHITE-M',
}

const studioItem: OrderItemDetails = {
  customization: {
    design: {
      finalPreviewUrls: {
        front: 'https://cdn.mpm.test/studio-front.png',
      },
      views: [
        {
          logos: [
            {
              name: 'logo.png',
              printFormat: 'A4',
            },
          ],
          viewId: 'front',
        },
      ],
    },
    product: {
      color: {
        label: 'Noir',
      },
      quantities: {
        L: 1,
      },
    },
  },
  id: 'studio-item',
  itemType: 'studio',
  productName: 'T-shirt studio',
  quantity: 1,
  totalPriceCents: 4500,
  unitPriceCents: 4500,
}

describe('OrderItemsList', () => {
  it('affiche un item shop avec taille, couleur, SKU et image', () => {
    render(<OrderItemsList items={[shopItem]} />)

    expect(screen.getByRole('heading', { name: 'T-shirt boutique' })).toBeInTheDocument()
    expect(screen.getByText('Taille : M')).toBeInTheDocument()
    expect(screen.getByText('Blanc')).toBeInTheDocument()
    expect(screen.getByText('SKU : TSHIRT-WHITE-M')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'T-shirt boutique' })).toHaveAttribute(
      'src',
      'https://api.mpm.test/uploads/variants/white-m.png',
    )
  })

  it('garde l’affichage existant pour un item studio', () => {
    render(<OrderItemsList items={[studioItem]} />)

    expect(screen.getByRole('heading', { name: 'T-shirt studio' })).toBeInTheDocument()
    expect(screen.getByText('Quantité : 1')).toBeInTheDocument()
    expect(screen.getByText('Personnalisation')).toBeInTheDocument()
    expect(screen.getByText('Couleur')).toBeInTheDocument()
    expect(screen.getByText('Noir')).toBeInTheDocument()
    expect(
      screen.getByRole('img', {
        name: 'Aperçu final T-shirt studio - Face avant',
      }),
    ).toBeInTheDocument()
  })

  it('affiche une commande mixte avec items shop et studio', () => {
    render(<OrderItemsList items={[shopItem, studioItem]} />)

    expect(screen.getByRole('heading', { name: 'T-shirt boutique' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'T-shirt studio' })).toBeInTheDocument()
    expect(screen.getByText('Boutique')).toBeInTheDocument()
    expect(screen.getByText('Personnalisation')).toBeInTheDocument()
  })
})
