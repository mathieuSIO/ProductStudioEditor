import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithRouter } from '../../../test/utils/render'
import type {
  AdminShopProduct,
  AdminShopProductImage,
  CreateAdminShopProductImagePayload,
  UpdateAdminShopProductImagePayload,
} from '../types/admin.types'
import { AdminShopProductGalleryPage } from './AdminShopProductGalleryPage'

const {
  createAdminShopProductImageMock,
  fetchAdminShopProductImagesMock,
  fetchAdminShopProductsMock,
  updateAdminShopProductImageMock,
  updateAdminShopProductImageStatusMock,
  uploadAdminShopProductImageMock,
} = vi.hoisted(() => ({
  createAdminShopProductImageMock: vi.fn<
    (
      productId: number,
      payload: CreateAdminShopProductImagePayload,
    ) => Promise<AdminShopProductImage>
  >(),
  fetchAdminShopProductImagesMock: vi.fn<
    (productId: number) => Promise<AdminShopProductImage[]>
  >(),
  fetchAdminShopProductsMock: vi.fn<() => Promise<AdminShopProduct[]>>(),
  updateAdminShopProductImageMock: vi.fn<
    (
      productId: number,
      imageId: number,
      payload: UpdateAdminShopProductImagePayload,
    ) => Promise<AdminShopProductImage>
  >(),
  updateAdminShopProductImageStatusMock: vi.fn<
    (
      productId: number,
      imageId: number,
      isActive: boolean,
    ) => Promise<AdminShopProductImage>
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
    createAdminShopProductImage: createAdminShopProductImageMock,
    fetchAdminShopProductImages: fetchAdminShopProductImagesMock,
    fetchAdminShopProducts: fetchAdminShopProductsMock,
    updateAdminShopProductImage: updateAdminShopProductImageMock,
    updateAdminShopProductImageStatus: updateAdminShopProductImageStatusMock,
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

function createGalleryImage(
  overrides: Partial<AdminShopProductImage> = {},
): AdminShopProductImage {
  return {
    altText: 'Vue devant',
    createdAt: '2026-01-01',
    displayOrder: 1,
    id: 40,
    imageStorageKey: 'gallery/front.png',
    imageUrl: '/uploads/gallery/front.png',
    isActive: true,
    shopProductId: 10,
    updatedAt: '2026-01-02',
    ...overrides,
  }
}

function renderPage() {
  renderWithRouter(<AdminShopProductGalleryPage />, {
    path: '/admin/shop-products/:productId/gallery',
    route: '/admin/shop-products/10/gallery',
  })
}

describe('AdminShopProductGalleryPage', () => {
  let images: AdminShopProductImage[]

  beforeEach(() => {
    images = [
      createGalleryImage(),
      createGalleryImage({
        altText: 'Vue dos',
        displayOrder: 2,
        id: 41,
        imageStorageKey: 'gallery/back.png',
        imageUrl: '/uploads/gallery/back.png',
        isActive: false,
      }),
    ]

    fetchAdminShopProductsMock.mockReset()
    fetchAdminShopProductImagesMock.mockReset()
    createAdminShopProductImageMock.mockReset()
    updateAdminShopProductImageMock.mockReset()
    updateAdminShopProductImageStatusMock.mockReset()
    uploadAdminShopProductImageMock.mockReset()

    fetchAdminShopProductsMock.mockResolvedValue([product])
    fetchAdminShopProductImagesMock.mockImplementation(async () => images)
    createAdminShopProductImageMock.mockImplementation(async (_productId, payload) => {
      const createdImage = createGalleryImage({
        altText: payload.altText ?? null,
        displayOrder: payload.displayOrder ?? 0,
        id: 50,
        imageStorageKey: payload.imageStorageKey ?? null,
        imageUrl: payload.imageUrl,
        isActive: payload.isActive ?? true,
      })

      images = [...images, createdImage]

      return createdImage
    })
    updateAdminShopProductImageMock.mockImplementation(async (_productId, imageId, payload) => {
      const updatedImage = {
        ...images.find((image) => image.id === imageId),
        ...payload,
      } as AdminShopProductImage

      images = images.map((image) => (image.id === imageId ? updatedImage : image))

      return updatedImage
    })
    updateAdminShopProductImageStatusMock.mockImplementation(
      async (_productId, imageId, isActive) => {
        const updatedImage = {
          ...images.find((image) => image.id === imageId),
          isActive,
        } as AdminShopProductImage

        images = images.map((image) =>
          image.id === imageId ? updatedImage : image,
        )

        return updatedImage
      },
    )
    uploadAdminShopProductImageMock.mockResolvedValue({
      storageKey: 'gallery/uploaded.png',
      url: '/uploads/gallery/uploaded.png',
    })
  })

  it('liste les images de galerie', async () => {
    renderPage()

    expect(await screen.findByText('Vue devant')).toBeInTheDocument()
    expect(screen.getByText('Vue dos')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Vue devant' })).toHaveAttribute(
      'src',
      'https://api.mpm.test/uploads/gallery/front.png',
    )
  })

  it('upload puis crée une image galerie', async () => {
    renderPage()
    await screen.findByText('Vue devant')

    const file = new File(['image'], 'gallery.png', { type: 'image/png' })
    await userEvent.upload(
      screen.getByLabelText(/Image/, { selector: 'input[type="file"]' }),
      file,
    )
    await screen.findByRole('img', { name: 'Apercu galerie' })
    await userEvent.type(screen.getByLabelText('Texte alternatif'), 'Vue cote')
    await userEvent.clear(screen.getByLabelText("Ordre d'affichage"))
    await userEvent.type(screen.getByLabelText("Ordre d'affichage"), '3')
    await userEvent.click(screen.getByRole('button', { name: "Ajouter l'image" }))

    await waitFor(() => {
      expect(createAdminShopProductImageMock).toHaveBeenCalledWith(10, {
        altText: 'Vue cote',
        displayOrder: 3,
        imageStorageKey: 'gallery/uploaded.png',
        imageUrl: '/uploads/gallery/uploaded.png',
        isActive: true,
      })
    })
    expect(await screen.findByText('Image galerie ajoutee.')).toBeInTheDocument()
  })

  it('modifie altText/displayOrder et active ou désactive une image', async () => {
    renderPage()
    await screen.findByText('Vue devant')

    await userEvent.click(screen.getAllByRole('button', { name: 'Modifier' })[0]!)
    await userEvent.clear(screen.getByLabelText('Texte alternatif'))
    await userEvent.type(screen.getByLabelText('Texte alternatif'), 'Nouvelle vue')
    await userEvent.clear(screen.getByLabelText("Ordre d'affichage"))
    await userEvent.type(screen.getByLabelText("Ordre d'affichage"), '4')
    await userEvent.click(
      screen.getByRole('button', { name: 'Enregistrer les modifications' }),
    )

    await waitFor(() => {
      expect(updateAdminShopProductImageMock).toHaveBeenCalledWith(
        10,
        40,
        expect.objectContaining({
          altText: 'Nouvelle vue',
          displayOrder: 4,
        }),
      )
    })

    await userEvent.click(screen.getAllByRole('button', { name: 'Desactiver' })[0]!)

    await waitFor(() => {
      expect(updateAdminShopProductImageStatusMock).toHaveBeenCalledWith(10, 40, false)
    })
  })
})
