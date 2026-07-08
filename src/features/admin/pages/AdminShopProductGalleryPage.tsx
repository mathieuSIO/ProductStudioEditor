import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { PanelCard } from '../../../components/ui/PanelCard'
import { useAuth } from '../../auth'
import {
  createAdminShopProductImage,
  fetchAdminShopProductImages,
  fetchAdminShopProducts,
  resolveShopProductImageUrl,
  updateAdminShopProductImage,
  updateAdminShopProductImageStatus,
  uploadAdminShopProductImage,
} from '../api/adminShopProductsApi'
import type {
  AdminShopProduct,
  AdminShopProductImage,
  CreateAdminShopProductImagePayload,
} from '../types/admin.types'

type GalleryFormData = {
  altText: string
  displayOrder: string
  imageStorageKey: string | null
  imageUrl: string | null
  isActive: boolean
}

const emptyFormData: GalleryFormData = {
  altText: '',
  displayOrder: '0',
  imageStorageKey: null,
  imageUrl: null,
  isActive: true,
}

export function AdminShopProductGalleryPage() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const { logout } = useAuth()
  const parsedProductId = parseProductId(productId)
  const [products, setProducts] = useState<AdminShopProduct[]>([])
  const [images, setImages] = useState<AdminShopProductImage[]>([])
  const [formData, setFormData] = useState<GalleryFormData>(emptyFormData)
  const [editingImage, setEditingImage] = useState<AdminShopProductImage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [updatingImageId, setUpdatingImageId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const product = useMemo(
    () =>
      parsedProductId === null
        ? null
        : products.find((currentProduct) => currentProduct.id === parsedProductId) ?? null,
    [parsedProductId, products],
  )

  useEffect(() => {
    if (parsedProductId === null) {
      setIsLoading(false)
      setError('Produit boutique introuvable.')
      return
    }

    void loadPageData(parsedProductId)
  }, [parsedProductId])

  async function loadPageData(requestedProductId: number) {
    setIsLoading(true)
    setError(null)

    try {
      const [loadedProducts, loadedImages] = await Promise.all([
        fetchAdminShopProducts(),
        fetchAdminShopProductImages(requestedProductId),
      ])

      setProducts(loadedProducts)
      setImages(sortGalleryImages(loadedImages))
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'La galerie produit est indisponible.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function loadImages(requestedProductId: number) {
    const loadedImages = await fetchAdminShopProductImages(requestedProductId)
    setImages(sortGalleryImages(loadedImages))
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function updateFormField<Field extends keyof GalleryFormData>(
    field: Field,
    value: GalleryFormData[Field],
  ) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }))
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]

    if (!file) {
      return
    }

    setFormError(null)
    setSuccess(null)
    setIsUploading(true)

    try {
      const uploadedImage = await uploadAdminShopProductImage(file)

      setFormData((currentFormData) => ({
        ...currentFormData,
        imageStorageKey: uploadedImage.storageKey,
        imageUrl: uploadedImage.url,
      }))
    } catch (uploadError) {
      setFormError(
        uploadError instanceof Error
          ? uploadError.message
          : "L'image galerie n'a pas pu etre uploadee.",
      )
    } finally {
      setIsUploading(false)
      input.value = ''
    }
  }

  function handleEditImage(image: AdminShopProductImage) {
    setEditingImage(image)
    setFormData(createFormDataFromImage(image))
    setFormError(null)
    setSuccess(null)
  }

  function handleCancelEdit() {
    setEditingImage(null)
    setFormData(emptyFormData)
    setFormError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (parsedProductId === null) {
      return
    }

    setFormError(null)
    setSuccess(null)

    const payload = createGalleryImagePayload(formData)

    if (!payload) {
      setFormError("Image et ordre d'affichage positif ou nul sont obligatoires.")
      return
    }

    setIsSaving(true)

    try {
      if (editingImage) {
        await updateAdminShopProductImage(parsedProductId, editingImage.id, payload)
        setSuccess('Image galerie modifiee.')
      } else {
        await createAdminShopProductImage(parsedProductId, payload)
        setSuccess('Image galerie ajoutee.')
      }

      setEditingImage(null)
      setFormData(emptyFormData)
      await loadImages(parsedProductId)
    } catch (saveError) {
      setFormError(
        saveError instanceof Error
          ? saveError.message
          : "L'image galerie n'a pas pu etre enregistree.",
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggleStatus(image: AdminShopProductImage) {
    if (parsedProductId === null) {
      return
    }

    setFormError(null)
    setSuccess(null)
    setUpdatingImageId(image.id)

    try {
      await updateAdminShopProductImageStatus(parsedProductId, image.id, !image.isActive)
      setSuccess(image.isActive ? 'Image galerie desactivee.' : 'Image galerie reactivee.')
      await loadImages(parsedProductId)
    } catch (statusError) {
      setFormError(
        statusError instanceof Error
          ? statusError.message
          : "Le statut de l'image galerie n'a pas pu etre modifie.",
      )
    } finally {
      setUpdatingImageId(null)
    }
  }

  const previewImageUrl = resolveShopProductImageUrl(formData.imageUrl)

  return (
    <section className="grid min-w-0 gap-4">
      <div className="rounded-[1.25rem] border border-stone-200 bg-white px-4 py-5 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.28)] sm:px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Administration
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">
              Galerie produit
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              {product
                ? `Gerez les images galerie de ${product.name}.`
                : 'Gerez les images galerie du produit boutique.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-[0.95rem] border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-white hover:text-emerald-800"
              onClick={() => navigate('/admin/shop-products')}
            >
              Produits
            </button>
            <button
              type="button"
              className="rounded-[0.95rem] border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-white hover:text-emerald-800"
              onClick={() => navigate('/admin')}
            >
              Admin
            </button>
            <button
              type="button"
              className="rounded-[0.95rem] bg-blue-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              onClick={handleLogout}
            >
              Deconnexion
            </button>
          </div>
        </div>
      </div>

      <PanelCard
        eyebrow={editingImage ? 'Modification' : 'Ajout'}
        title={editingImage ? 'Modifier une image galerie' : 'Ajouter une image galerie'}
        description="Uploadez une image, puis renseignez son texte alternatif et son ordre d'affichage."
      >
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 lg:grid-cols-[12rem_minmax(0,1fr)]">
            <GalleryPreview imageUrl={previewImageUrl} />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold text-blue-950 sm:col-span-2">
                Image
                <input
                  accept="image/*"
                  className="rounded-[0.9rem] border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-900 file:mr-3 file:rounded-[0.75rem] file:border-0 file:bg-blue-950 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white disabled:cursor-not-allowed disabled:bg-stone-100"
                  disabled={isUploading || isSaving}
                  type="file"
                  onChange={handleUpload}
                />
                <span className="text-xs font-medium text-stone-500">
                  {isUploading ? 'Upload en cours...' : "L'image est envoyee avant l'enregistrement."}
                </span>
              </label>
              <FormField
                label="Texte alternatif"
                name="altText"
                onChange={(value) => updateFormField('altText', value)}
                value={formData.altText}
              />
              <FormField
                label="Ordre d'affichage"
                min="0"
                name="displayOrder"
                onChange={(value) => updateFormField('displayOrder', value)}
                step="1"
                type="number"
                value={formData.displayOrder}
              />
              <label className="flex items-center gap-2 rounded-[0.9rem] border border-stone-200 bg-stone-50 px-3 py-3 text-sm font-semibold text-blue-950">
                <input
                  checked={formData.isActive}
                  className="h-4 w-4 accent-emerald-700"
                  type="checkbox"
                  onChange={(event) =>
                    updateFormField('isActive', event.currentTarget.checked)
                  }
                />
                Image active
              </label>
            </div>
          </div>

          <Feedback error={formError} success={success} />

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-[0.95rem] bg-blue-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-400"
              disabled={isSaving || isUploading}
            >
              {isUploading
                ? 'Upload image...'
                : isSaving
                  ? 'Enregistrement...'
                  : editingImage
                    ? 'Enregistrer les modifications'
                    : "Ajouter l'image"}
            </button>
            {editingImage ? (
              <button
                type="button"
                className="rounded-[0.95rem] border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-white hover:text-emerald-800"
                disabled={isSaving || isUploading}
                onClick={handleCancelEdit}
              >
                Annuler
              </button>
            ) : null}
          </div>
        </form>
      </PanelCard>

      <PanelCard
        eyebrow="Galerie"
        title="Images existantes"
        description="Controlez les visuels disponibles pour la fiche produit publique."
        aside={
          <div className="rounded-[0.95rem] border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            {images.length} image{images.length > 1 ? 's' : ''}
          </div>
        }
      >
        {isLoading ? (
          <StateMessage title="Chargement de la galerie" description="Recuperation des images." />
        ) : error ? (
          <StateMessage
            title="Galerie indisponible"
            description={error}
            tone="error"
            actionLabel="Retour aux produits"
            onAction={() => navigate('/admin/shop-products')}
          />
        ) : images.length === 0 ? (
          <StateMessage
            title="Aucune image galerie"
            description="Les images ajoutees apparaitront ici."
          />
        ) : (
          <GalleryImagesTable
            images={images}
            updatingImageId={updatingImageId}
            onEdit={handleEditImage}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </PanelCard>
    </section>
  )
}

type GalleryImagesTableProps = {
  images: AdminShopProductImage[]
  onEdit: (image: AdminShopProductImage) => void
  onToggleStatus: (image: AdminShopProductImage) => void
  updatingImageId: number | null
}

function GalleryImagesTable({
  images,
  onEdit,
  onToggleStatus,
  updatingImageId,
}: GalleryImagesTableProps) {
  return (
    <div className="overflow-hidden rounded-[1.1rem] border border-stone-200 bg-white">
      <table className="w-full min-w-[860px] table-fixed border-collapse text-left text-sm">
        <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
          <tr>
            <th className="w-[14%] px-4 py-3">Image</th>
            <th className="w-[34%] px-4 py-3">Alt text</th>
            <th className="w-[14%] px-4 py-3">Ordre</th>
            <th className="w-[14%] px-4 py-3">Statut</th>
            <th className="w-[24%] px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {images.map((image) => (
            <tr key={image.id} className="transition hover:bg-blue-50/60">
              <td className="px-4 py-3">
                <GalleryThumbnail imageUrl={image.imageUrl} altText={image.altText} />
              </td>
              <td className="px-4 py-3 text-stone-700">
                {image.altText ?? 'Alt text non renseigne'}
              </td>
              <td className="px-4 py-3 font-semibold text-blue-950">
                {image.displayOrder}
              </td>
              <td className="px-4 py-3">
                <StatusBadge isActive={image.isActive} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-[0.85rem] border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-white hover:text-emerald-800"
                    onClick={() => onEdit(image)}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    className={`rounded-[0.85rem] px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400 ${
                      image.isActive
                        ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-white'
                        : 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-white'
                    }`}
                    disabled={updatingImageId === image.id}
                    onClick={() => onToggleStatus(image)}
                  >
                    {updatingImageId === image.id ? '...' : image.isActive ? 'Desactiver' : 'Reactiver'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type GalleryPreviewProps = {
  imageUrl: string | null
}

function GalleryPreview({ imageUrl }: GalleryPreviewProps) {
  if (!imageUrl) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-[1rem] border border-dashed border-stone-200 bg-stone-50 px-3 text-center text-sm font-semibold text-stone-400">
        Aucune image
      </div>
    )
  }

  return (
    <img
      alt="Apercu galerie"
      className="aspect-square w-full rounded-[1rem] border border-stone-200 object-cover"
      src={imageUrl}
    />
  )
}

type GalleryThumbnailProps = {
  altText: string | null
  imageUrl: string | null
}

function GalleryThumbnail({ altText, imageUrl }: GalleryThumbnailProps) {
  const resolvedImageUrl = resolveShopProductImageUrl(imageUrl)

  if (!resolvedImageUrl) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-[0.85rem] border border-stone-200 bg-stone-50 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">
        Image
      </div>
    )
  }

  return (
    <img
      alt={altText ?? 'Image galerie'}
      className="h-16 w-16 rounded-[0.85rem] border border-stone-200 object-cover"
      src={resolvedImageUrl}
    />
  )
}

type FormFieldProps = {
  label: string
  min?: string
  name: string
  onChange: (value: string) => void
  step?: string
  type?: 'number' | 'text'
  value: string
}

function FormField({
  label,
  min,
  name,
  onChange,
  step,
  type = 'text',
  value,
}: FormFieldProps) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-blue-950">
      {label}
      <input
        className="rounded-[0.9rem] border border-stone-200 bg-white px-3 py-3 text-sm font-medium text-stone-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
        min={min}
        name={name}
        step={step}
        type={type}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  )
}

type FeedbackProps = {
  error: string | null
  success: string | null
}

function Feedback({ error, success }: FeedbackProps) {
  if (error) {
    return (
      <div className="rounded-[1rem] border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
        {error}
      </div>
    )
  }

  if (success) {
    return (
      <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800">
        {success}
      </div>
    )
  }

  return null
}

function StatusBadge({ isActive }: Pick<AdminShopProductImage, 'isActive'>) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        isActive
          ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
          : 'border-stone-200 bg-stone-100 text-stone-600'
      }`}
    >
      {isActive ? 'Actif' : 'Inactif'}
    </span>
  )
}

type StateMessageProps = {
  actionLabel?: string
  description: string
  onAction?: () => void
  title: string
  tone?: 'default' | 'error'
}

function StateMessage({
  actionLabel,
  description,
  onAction,
  title,
  tone = 'default',
}: StateMessageProps) {
  const className =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-stone-200 bg-stone-50 text-stone-600'

  return (
    <div className={`rounded-[1rem] border px-4 py-8 text-center ${className}`}>
      <p className="text-base font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          className="mt-4 rounded-[0.95rem] bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}

function createFormDataFromImage(image: AdminShopProductImage): GalleryFormData {
  return {
    altText: image.altText ?? '',
    displayOrder: String(image.displayOrder),
    imageStorageKey: image.imageStorageKey,
    imageUrl: image.imageUrl,
    isActive: image.isActive,
  }
}

function createGalleryImagePayload(
  formData: GalleryFormData,
): CreateAdminShopProductImagePayload | null {
  const displayOrder = Number(formData.displayOrder)

  if (
    !formData.imageUrl ||
    !Number.isInteger(displayOrder) ||
    displayOrder < 0
  ) {
    return null
  }

  return {
    altText: normalizeOptionalText(formData.altText),
    displayOrder,
    imageStorageKey: formData.imageStorageKey,
    imageUrl: formData.imageUrl,
    isActive: formData.isActive,
  }
}

function sortGalleryImages(
  images: AdminShopProductImage[],
): AdminShopProductImage[] {
  return [...images].sort((firstImage, secondImage) => {
    const orderComparison = firstImage.displayOrder - secondImage.displayOrder

    return orderComparison === 0 ? firstImage.id - secondImage.id : orderComparison
  })
}

function normalizeOptionalText(value: string): string | null {
  const normalizedValue = value.trim()

  return normalizedValue.length > 0 ? normalizedValue : null
}

function parseProductId(value: string | undefined): number | null {
  if (!value) {
    return null
  }

  const parsedValue = Number(value)

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null
}
