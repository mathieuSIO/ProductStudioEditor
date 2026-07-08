import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { createShopCartItem, createStudioCartItem } from '../../../test/factories/cart'
import { CartItemCard } from './CartItemCard'

describe('CartItemCard', () => {
  it('affiche un item shop avec nom, taille, couleur et image', () => {
    render(
      <CartItemCard
        item={createShopCartItem({
          colorName: 'Noir',
          imageUrl: '/uploads/products/shop.png',
          name: 'T-shirt boutique',
          quantity: 2,
          sizeLabel: 'L',
        })}
        onRemove={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'T-shirt boutique' })).toBeInTheDocument()
    expect(screen.getByText('Quantite : 2')).toBeInTheDocument()
    expect(screen.getByText('Taille : L')).toBeInTheDocument()
    expect(screen.getByText('Noir')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'T-shirt boutique' })).toHaveAttribute(
      'src',
      'https://api.mpm.test/uploads/products/shop.png',
    )
  })

  it('affiche un item studio sans casser le rendu existant', () => {
    render(
      <CartItemCard
        item={createStudioCartItem({
          design: {
            customPlacement: 'Logo coeur',
            finalPreviewUrls: {
              front: 'https://cdn.mpm.test/front.png',
            },
            views: [
              {
                logos: [
                  {
                    id: 'logo-1',
                    mimeType: 'image/png',
                    name: 'logo.png',
                    originalFileSize: 100,
                    position: { x: 0, y: 0 },
                    previewPersistence: 'persistent-url',
                    previewUrl: 'https://cdn.mpm.test/logo.png',
                    printFormat: 'A4',
                    size: { height: 10, width: 10 },
                    source: 'uploaded-file',
                  },
                ],
                viewId: 'front',
              },
            ],
          },
        })}
        onRemove={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'T-shirt studio' })).toBeInTheDocument()
    expect(screen.getByText('2 pièces')).toBeInTheDocument()
    expect(screen.getByText('Logo coeur')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Apercu final Face avant' })).toBeInTheDocument()
  })

  it('appelle le callback de suppression avec l’id item', async () => {
    const onRemove = vi.fn()

    render(
      <CartItemCard
        item={createShopCartItem({ id: 'item-to-remove' })}
        onRemove={onRemove}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Supprimer' }))

    expect(onRemove).toHaveBeenCalledWith('item-to-remove')
  })
})
