import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createShopProduct, createShopProductVariant } from '../../test/factories/shop'
import { renderWithRouter } from '../../test/utils/render'
import type { ShopProduct } from '../../features/shop'
import { ShopProductPage } from './ShopProductPage'

const { addItemMock, fetchShopProductBySlugMock, trackMetaEventMock } = vi.hoisted(() => ({
  addItemMock: vi.fn(),
  fetchShopProductBySlugMock: vi.fn<
    (slug: string, signal?: AbortSignal) => Promise<ShopProduct>
  >(),
  trackMetaEventMock: vi.fn(),
}))

vi.mock('../../features/cart', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../features/cart')>()

  return {
    ...actual,
    useCart: () => ({
      addItem: addItemMock,
    }),
  }
})

vi.mock('../../features/shop', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../features/shop')>()

  return {
    ...actual,
    fetchShopProductBySlug: fetchShopProductBySlugMock,
  }
})

vi.mock('../../lib/metaPixel', () => ({
  trackMetaEvent: trackMetaEventMock,
}))

function createProductForPage(): ShopProduct {
  return createShopProduct({
    description: 'Produit confortable pour la personnalisation.',
    imageUrl: '/uploads/products/main.png',
    images: [
      {
        altText: 'Vue devant',
        displayOrder: 1,
        id: 101,
        imageStorageKey: 'gallery/front.png',
        imageUrl: '/uploads/gallery/front.png',
      },
      {
        altText: 'Vue dos',
        displayOrder: 2,
        id: 102,
        imageStorageKey: 'gallery/back.png',
        imageUrl: '/uploads/gallery/back.png',
      },
    ],
    name: 'T-shirt boutique test',
    priceCents: 2500,
    slug: 't-shirt-boutique-test',
    variants: [
      createShopProductVariant({
        colorHex: '#ffffff',
        colorName: 'Blanc',
        id: 201,
        imageUrl: '/uploads/variants/white-m.png',
        priceCents: 2600,
        sizeLabel: 'M',
        stockQuantity: 4,
      }),
      createShopProductVariant({
        colorHex: '#ffffff',
        colorName: 'Blanc',
        id: 202,
        imageUrl: null,
        sizeLabel: 'L',
        stockQuantity: 0,
      }),
      createShopProductVariant({
        colorHex: '#111111',
        colorName: 'Noir',
        id: 203,
        imageUrl: '/uploads/variants/black-s.png',
        priceCents: 2700,
        sizeLabel: 'S',
        stockQuantity: 2,
      }),
    ],
  })
}

async function renderLoadedProductPage(product = createProductForPage()) {
  fetchShopProductBySlugMock.mockResolvedValue(product)

  renderWithRouter(<ShopProductPage />, {
    path: '/boutique/:slug',
    route: '/boutique/t-shirt-boutique-test',
  })

  await screen.findByRole('heading', { name: product.name })

  return product
}

describe('ShopProductPage', () => {
  beforeEach(() => {
    addItemMock.mockReset()
    fetchShopProductBySlugMock.mockReset()
    trackMetaEventMock.mockReset()
  })

  it('affiche le produit et les couleurs disponibles', async () => {
    const product = await renderLoadedProductPage()

    expect(fetchShopProductBySlugMock).toHaveBeenCalledWith(
      product.slug,
      expect.any(AbortSignal),
    )
    expect(screen.getByText('Produit confortable pour la personnalisation.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Blanc/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Noir/ })).toBeInTheDocument()
  })

  it('affiche les tailles de la couleur sélectionnée et désactive celles hors stock', async () => {
    await renderLoadedProductPage()

    const sizeM = screen.getByRole('button', { name: 'M' })
    const sizeL = screen.getByRole('button', { name: 'L - indisponible' })

    expect(sizeM).toBeEnabled()
    expect(sizeL).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: /Noir/ }))

    expect(screen.getByRole('button', { name: 'S' })).toBeEnabled()
    expect(screen.queryByRole('button', { name: 'M' })).not.toBeInTheDocument()
  })

  it("change l'image principale au clic galerie", async () => {
    await renderLoadedProductPage()

    await userEvent.click(screen.getByRole('button', { name: 'Vue dos' }))

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'T-shirt boutique test' })).toHaveAttribute(
        'src',
        'https://api.mpm.test/uploads/gallery/back.png',
      )
    })
  })

  it("change l'image principale au choix d'une variante avec image", async () => {
    await renderLoadedProductPage()

    await userEvent.click(screen.getByRole('button', { name: /Noir/ }))

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'T-shirt boutique test' })).toHaveAttribute(
        'src',
        'https://api.mpm.test/uploads/variants/black-s.png',
      )
    })
  })

  it('ajoute au panier avec shopProductVariantId', async () => {
    vi.stubGlobal('crypto', {
      randomUUID: () => 'shop-cart-item-id',
    })
    const product = await renderLoadedProductPage()

    await userEvent.click(screen.getByRole('button', { name: /Noir/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter au panier' }))

    expect(addItemMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'shop-cart-item-id',
        kind: 'shop',
        shopProductVariantId: 203,
      }),
    )
    expect(trackMetaEventMock).toHaveBeenCalledWith(
      'AddToCart',
      expect.objectContaining({
        content_ids: [product.id],
        value: 27,
      }),
    )
  })

  it("place l'achat et la reassurance avant la description", async () => {
    await renderLoadedProductPage()

    const addToCartButton = screen.getByRole('button', {
      name: 'Ajouter au panier',
    })
    const reassurance = screen.getByRole('list', {
      name: 'Informations de confiance',
    })
    const description = screen.getByText(
      'Produit confortable pour la personnalisation.',
    )

    expect(
      addToCartButton.compareDocumentPosition(reassurance) &
      Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      reassurance.compareDocumentPosition(description) &
      Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('conserve la quantite choisie lors de l ajout au panier', async () => {
    await renderLoadedProductPage()

    const quantityInput = screen.getByRole('spinbutton', { name: 'Quantite' })
    await userEvent.click(quantityInput)
    await userEvent.type(quantityInput, '2')
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter au panier' }))

    expect(addItemMock).toHaveBeenCalledWith(
      expect.objectContaining({ quantity: 2 }),
    )
  })
})
