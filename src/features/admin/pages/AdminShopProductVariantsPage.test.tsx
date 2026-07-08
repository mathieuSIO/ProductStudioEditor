import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithRouter } from '../../../test/utils/render'
import type {
  AdminShopProduct,
  AdminShopProductVariant,
  CreateAdminShopProductVariantPayload,
  UpdateAdminShopProductVariantPayload,
} from '../types/admin.types'
import { AdminShopProductVariantsPage } from './AdminShopProductVariantsPage'

const {
  createAdminShopProductVariantMock,
  fetchAdminShopProductsMock,
  fetchAdminShopProductVariantsMock,
  updateAdminShopProductVariantMock,
  updateAdminShopProductVariantStatusMock,
  uploadAdminShopProductImageMock,
} = vi.hoisted(() => ({
  createAdminShopProductVariantMock: vi.fn<
    (
      productId: number,
      payload: CreateAdminShopProductVariantPayload,
    ) => Promise<AdminShopProductVariant>
  >(),
  fetchAdminShopProductsMock: vi.fn<() => Promise<AdminShopProduct[]>>(),
  fetchAdminShopProductVariantsMock: vi.fn<
    (productId: number) => Promise<AdminShopProductVariant[]>
  >(),
  updateAdminShopProductVariantMock: vi.fn<
    (
      productId: number,
      variantId: number,
      payload: UpdateAdminShopProductVariantPayload,
    ) => Promise<AdminShopProductVariant>
  >(),
  updateAdminShopProductVariantStatusMock: vi.fn<
    (
      productId: number,
      variantId: number,
      isActive: boolean,
    ) => Promise<AdminShopProductVariant>
  >(),
  uploadAdminShopProductImageMock: vi.fn<
    (file: File) => Promise<{ storageKey: string; url: string }>
  >(),
}))

vi.mock('../../auth', () => ({
  useAuth: () => ({
    logout: vi.fn(),
  }),
}))

vi.mock('../api/adminShopProductsApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/adminShopProductsApi')>()

  return {
    ...actual,
    createAdminShopProductVariant: createAdminShopProductVariantMock,
    fetchAdminShopProductVariants: fetchAdminShopProductVariantsMock,
    fetchAdminShopProducts: fetchAdminShopProductsMock,
    updateAdminShopProductVariant: updateAdminShopProductVariantMock,
    updateAdminShopProductVariantStatus: updateAdminShopProductVariantStatusMock,
    uploadAdminShopProductImage: uploadAdminShopProductImageMock,
  }
})

const product: AdminShopProduct = {
  createdAt: '2026-01-01',
  description: null,
  id: 10,
  imageStorageKey: null,
  imageUrl: null,
  isActive: true,
  name: 'T-shirt admin',
  priceCents: 2500,
  slug: 't-shirt-admin',
  updatedAt: '2026-01-02',
}

function createVariant(
  overrides: Partial<AdminShopProductVariant> = {},
): AdminShopProductVariant {
  return {
    colorHex: '#ffffff',
    colorName: 'Blanc',
    createdAt: '2026-01-01',
    id: 20,
    imageStorageKey: 'variants/white-m.png',
    imageUrl: '/uploads/variants/white-m.png',
    isActive: true,
    priceCents: 2600,
    shopProductId: 10,
    sizeLabel: 'M',
    sku: 'TSHIRT-WHITE-M',
    stockQuantity: 8,
    updatedAt: '2026-01-02',
    ...overrides,
  }
}

function renderPage() {
  renderWithRouter(<AdminShopProductVariantsPage />, {
    path: '/admin/shop-products/:productId/variants',
    route: '/admin/shop-products/10/variants',
  })
}

describe('AdminShopProductVariantsPage', () => {
  let variants: AdminShopProductVariant[]

  beforeEach(() => {
    variants = [
      createVariant(),
      createVariant({
        colorHex: '#111111',
        colorName: 'Noir',
        id: 21,
        imageStorageKey: null,
        imageUrl: null,
        isActive: false,
        priceCents: null,
        sizeLabel: 'L',
        sku: null,
        stockQuantity: 0,
      }),
    ]

    fetchAdminShopProductsMock.mockReset()
    fetchAdminShopProductVariantsMock.mockReset()
    createAdminShopProductVariantMock.mockReset()
    updateAdminShopProductVariantMock.mockReset()
    updateAdminShopProductVariantStatusMock.mockReset()
    uploadAdminShopProductImageMock.mockReset()

    fetchAdminShopProductsMock.mockResolvedValue([product])
    fetchAdminShopProductVariantsMock.mockImplementation(async () => variants)
    createAdminShopProductVariantMock.mockImplementation(async (_productId, payload) => {
      const createdVariant = createVariant({
        colorHex: payload.colorHex ?? null,
        colorName: payload.colorName,
        id: 30,
        imageStorageKey: payload.imageStorageKey ?? null,
        imageUrl: payload.imageUrl ?? null,
        isActive: payload.isActive ?? true,
        priceCents: payload.priceCents ?? null,
        sizeLabel: payload.sizeLabel,
        sku: payload.sku ?? null,
        stockQuantity: payload.stockQuantity,
      })

      variants = [...variants, createdVariant]

      return createdVariant
    })
    updateAdminShopProductVariantMock.mockImplementation(async (_productId, variantId, payload) => {
      const updatedVariant = {
        ...variants.find((variant) => variant.id === variantId),
        ...payload,
      } as AdminShopProductVariant

      variants = variants.map((variant) =>
        variant.id === variantId ? updatedVariant : variant,
      )

      return updatedVariant
    })
    updateAdminShopProductVariantStatusMock.mockImplementation(
      async (_productId, variantId, isActive) => {
        const updatedVariant = {
          ...variants.find((variant) => variant.id === variantId),
          isActive,
        } as AdminShopProductVariant

        variants = variants.map((variant) =>
          variant.id === variantId ? updatedVariant : variant,
        )

        return updatedVariant
      },
    )
    uploadAdminShopProductImageMock.mockResolvedValue({
      storageKey: 'variants/uploaded.png',
      url: '/uploads/variants/uploaded.png',
    })
  })

  it('liste les variantes et affiche l’image variante', async () => {
    renderPage()

    expect(await screen.findByText('TSHIRT-WHITE-M')).toBeInTheDocument()
    expect(screen.getByText('Blanc')).toBeInTheDocument()
    expect(screen.getByText('Noir')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Variante' })).toHaveAttribute(
      'src',
      'https://api.mpm.test/uploads/variants/white-m.png',
    )
  })

  it('crée une variante avec image uploadée', async () => {
    renderPage()
    await screen.findByText('TSHIRT-WHITE-M')

    const file = new File(['image'], 'variant.png', { type: 'image/png' })
    await userEvent.upload(screen.getByLabelText(/Image variante/), file)
    await screen.findByText('Image variante uploadee.')
    await userEvent.type(screen.getByLabelText('Taille'), 'XL')
    await userEvent.type(screen.getByLabelText('Couleur'), 'Rouge')
    await userEvent.type(screen.getByLabelText('Hex couleur'), '#ff0000')
    await userEvent.type(screen.getByLabelText('SKU'), 'TSHIRT-RED-XL')
    await userEvent.type(screen.getByLabelText('Prix specifique (EUR)'), '29.90')
    await userEvent.clear(screen.getByLabelText('Stock'))
    await userEvent.type(screen.getByLabelText('Stock'), '5')
    await userEvent.click(screen.getByRole('button', { name: 'Creer la variante' }))

    await waitFor(() => {
      expect(createAdminShopProductVariantMock).toHaveBeenCalledWith(10, {
        colorHex: '#ff0000',
        colorName: 'Rouge',
        imageStorageKey: 'variants/uploaded.png',
        imageUrl: '/uploads/variants/uploaded.png',
        isActive: true,
        priceCents: 2990,
        sizeLabel: 'XL',
        sku: 'TSHIRT-RED-XL',
        stockQuantity: 5,
      })
    })
    expect(await screen.findByText('Variante creee.')).toBeInTheDocument()
  })

  it('édite stock/prix et active ou désactive une variante', async () => {
    renderPage()
    await screen.findByText('TSHIRT-WHITE-M')

    const variantRow = screen.getByRole('row', { name: /TSHIRT-WHITE-M/ })

    await userEvent.click(within(variantRow).getByRole('button', { name: 'Modifier' }))
    await userEvent.clear(screen.getByLabelText('Prix specifique (EUR)'))
    await userEvent.type(screen.getByLabelText('Prix specifique (EUR)'), '31.50')
    await userEvent.clear(screen.getByLabelText('Stock'))
    await userEvent.type(screen.getByLabelText('Stock'), '3')
    await userEvent.click(
      screen.getByRole('button', { name: 'Enregistrer les modifications' }),
    )

    await waitFor(() => {
      expect(updateAdminShopProductVariantMock).toHaveBeenCalledWith(
        10,
        20,
        expect.objectContaining({
          priceCents: 3150,
          stockQuantity: 3,
        }),
      )
    })

    await userEvent.click(within(variantRow).getByRole('button', { name: 'Desactiver' }))

    await waitFor(() => {
      expect(updateAdminShopProductVariantStatusMock).toHaveBeenCalledWith(10, 20, false)
    })
  })
})
