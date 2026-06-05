import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'

import {
  resolveShopProductImageUrl,
  uploadAdminShopProductImage,
} from '../api/adminShopProductsApi'
import type {
  AdminShopProduct,
  CreateAdminShopProductPayload,
  UpdateAdminShopProductPayload,
} from '../types/admin.types'

export type AdminShopProductFormPayload =
  | CreateAdminShopProductPayload
  | UpdateAdminShopProductPayload

type ShopProductFormData = {
  description: string
  imageUrl: string | null
  isActive: boolean
  name: string
  priceEuros: string
  slug: string
}

type AdminShopProductFormProps = {
  isSaving: boolean
  mode: 'create' | 'edit'
  onCancel?: () => void
  onSubmit: (payload: AdminShopProductFormPayload) => Promise<boolean>
  product?: AdminShopProduct | null
}

const emptyFormData: ShopProductFormData = {
  description: '',
  imageUrl: null,
  isActive: true,
  name: '',
  priceEuros: '',
  slug: '',
}

export function AdminShopProductForm({
  isSaving,
  mode,
  onCancel,
  onSubmit,
  product = null,
}: AdminShopProductFormProps) {
  const [formData, setFormData] = useState<ShopProductFormData>(() =>
    createInitialFormData(product),
  )
  const [isSlugTouched, setIsSlugTouched] = useState(Boolean(product))
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    setFormData(createInitialFormData(product))
    setIsSlugTouched(Boolean(product))
    setUploadError(null)
    setValidationError(null)
  }, [product])

  function updateField<Field extends keyof ShopProductFormData>(
    field: Field,
    value: ShopProductFormData[Field],
  ) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }))
  }

  function handleNameChange(value: string) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      name: value,
      slug: isSlugTouched ? currentFormData.slug : createSlug(value),
    }))
  }

  function handleSlugChange(value: string) {
    setIsSlugTouched(true)
    updateField('slug', createSlug(value))
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]

    if (!file) {
      return
    }

    setUploadError(null)
    setValidationError(null)
    setIsUploadingImage(true)

    try {
      const uploadedImage = await uploadAdminShopProductImage(file)
      updateField('imageUrl', uploadedImage.url)
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "L'image du produit n'a pas pu etre envoyee.",
      )
    } finally {
      setIsUploadingImage(false)
      event.currentTarget.value = ''
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setValidationError(null)

    const payload = createPayload(formData, mode)

    if (!payload) {
      setValidationError('Nom, slug et prix positif sont obligatoires.')
      return
    }

    const didSave = await onSubmit(payload)

    if (mode === 'create' && didSave) {
      setFormData(emptyFormData)
      setIsSlugTouched(false)
    }
  }

  const previewImageUrl = resolveShopProductImageUrl(formData.imageUrl)

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Nom"
            name="name"
            onChange={handleNameChange}
            required
            value={formData.name}
          />
          <FormField
            label="Slug"
            name="slug"
            onChange={handleSlugChange}
            required
            value={formData.slug}
          />
          <FormField
            label="Prix TTC (EUR)"
            min="0.01"
            name="price"
            onChange={(value) => updateField('priceEuros', value)}
            required
            step="0.01"
            type="number"
            value={formData.priceEuros}
          />
          <label className="flex items-center gap-2 rounded-[0.9rem] border border-stone-200 bg-stone-50 px-3 py-3 text-sm font-semibold text-blue-950">
            <input
              checked={formData.isActive}
              className="h-4 w-4 accent-emerald-700"
              type="checkbox"
              onChange={(event) =>
                updateField('isActive', event.currentTarget.checked)
              }
            />
            Produit actif
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-blue-950 sm:col-span-2">
            Description
            <textarea
              className="min-h-[7rem] rounded-[0.9rem] border border-stone-200 bg-white px-3 py-3 text-sm font-medium text-stone-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
              name="description"
              value={formData.description}
              onChange={(event) =>
                updateField('description', event.currentTarget.value)
              }
            />
          </label>
        </div>

        <div className="grid gap-3 rounded-[1rem] border border-stone-200 bg-stone-50 p-3">
          <div className="aspect-[4/3] overflow-hidden rounded-[0.9rem] border border-stone-200 bg-white">
            {previewImageUrl ? (
              <img
                alt="Apercu du produit"
                className="h-full w-full object-cover"
                src={previewImageUrl}
              />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm font-semibold text-stone-400">
                Aucune image
              </div>
            )}
          </div>
          <label className="grid gap-1.5 text-sm font-semibold text-blue-950">
            Image produit
            <input
              accept="image/*"
              className="rounded-[0.9rem] border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-900 file:mr-3 file:rounded-[0.75rem] file:border-0 file:bg-blue-950 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
              disabled={isUploadingImage || isSaving}
              type="file"
              onChange={handleImageChange}
            />
          </label>
          <p className="text-xs leading-5 text-stone-500">
            {isUploadingImage
              ? 'Upload image en cours...'
              : "L'image est envoyee avant l'enregistrement du produit."}
          </p>
        </div>
      </div>

      {validationError || uploadError ? (
        <div className="rounded-[1rem] border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
          {validationError ?? uploadError}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-[0.95rem] bg-blue-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-400"
          disabled={isSaving || isUploadingImage}
        >
          {isSaving
            ? 'Enregistrement...'
            : mode === 'create'
              ? 'Creer le produit'
              : 'Enregistrer les modifications'}
        </button>
        {onCancel ? (
          <button
            type="button"
            className="rounded-[0.95rem] border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-white hover:text-emerald-800"
            disabled={isSaving || isUploadingImage}
            onClick={onCancel}
          >
            Annuler
          </button>
        ) : null}
      </div>
    </form>
  )
}

type FormFieldProps = {
  label: string
  min?: string
  name: string
  onChange: (value: string) => void
  required?: boolean
  step?: string
  type?: 'number' | 'text'
  value: string
}

function FormField({
  label,
  min,
  name,
  onChange,
  required = false,
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
        required={required}
        step={step}
        type={type}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  )
}

function createInitialFormData(
  product: AdminShopProduct | null,
): ShopProductFormData {
  if (!product) {
    return emptyFormData
  }

  return {
    description: product.description ?? '',
    imageUrl: product.imageUrl,
    isActive: product.isActive,
    name: product.name,
    priceEuros: (product.priceCents / 100).toFixed(2),
    slug: product.slug,
  }
}

function createPayload(
  formData: ShopProductFormData,
  mode: 'create' | 'edit',
): AdminShopProductFormPayload | null {
  const name = formData.name.trim()
  const slug = formData.slug.trim()
  const priceCents = eurosToCents(formData.priceEuros)

  if (!name || !slug || priceCents === null || priceCents <= 0) {
    return null
  }

  const payload = {
    description: normalizeOptionalText(formData.description),
    imageUrl: formData.imageUrl,
    isActive: formData.isActive,
    name,
    priceCents,
    slug,
  }

  return mode === 'create' ? payload : payload
}

function eurosToCents(value: string): number | null {
  const normalizedValue = value.trim().replace(',', '.')
  const euros = Number(normalizedValue)

  if (!Number.isFinite(euros)) {
    return null
  }

  return Math.round(euros * 100)
}

function normalizeOptionalText(value: string): string | null {
  const normalizedValue = value.trim()

  return normalizedValue.length > 0 ? normalizedValue : null
}

function createSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
