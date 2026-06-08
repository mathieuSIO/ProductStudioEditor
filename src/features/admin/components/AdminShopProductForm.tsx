import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'

import {
  resolveShopProductImageUrl,
  uploadAdminShopProductImage,
} from '../api/adminShopProductsApi'
import type {
  AdminShopProduct,
  CreateAdminShopProductPayload,
  CreateAdminShopProductVariantPayload,
  UpdateAdminShopProductPayload,
} from '../types/admin.types'

export type AdminShopProductFormPayload =
  | CreateAdminShopProductPayload
  | UpdateAdminShopProductPayload

type ShopProductFormData = {
  description: string
  imageStorageKey: string | null
  imageUrl: string | null
  isImageChanged: boolean
  isActive: boolean
  name: string
  priceEuros: string
  slug: string
}

type TemporaryVariant = CreateAdminShopProductVariantPayload & {
  clientId: string
}

type VariantFormData = {
  colorHex: string
  colorName: string
  isActive: boolean
  priceEuros: string
  sizeLabel: string
  sku: string
  stockQuantity: string
}

type AdminShopProductFormProps = {
  isSaving: boolean
  mode: 'create' | 'edit'
  onCancel?: () => void
  onSubmit: (
    payload: AdminShopProductFormPayload,
    variants: CreateAdminShopProductVariantPayload[],
  ) => Promise<boolean>
  product?: AdminShopProduct | null
}

const emptyFormData: ShopProductFormData = {
  description: '',
  imageStorageKey: null,
  imageUrl: null,
  isImageChanged: false,
  isActive: true,
  name: '',
  priceEuros: '',
  slug: '',
}

const emptyVariantFormData: VariantFormData = {
  colorHex: '',
  colorName: '',
  isActive: true,
  priceEuros: '',
  sizeLabel: '',
  sku: '',
  stockQuantity: '0',
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
  const [variantFormData, setVariantFormData] =
    useState<VariantFormData>(emptyVariantFormData)
  const [temporaryVariants, setTemporaryVariants] = useState<TemporaryVariant[]>(
    [],
  )
  const [editingVariantClientId, setEditingVariantClientId] = useState<
    string | null
  >(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [variantError, setVariantError] = useState<string | null>(null)

  useEffect(() => {
    setFormData(createInitialFormData(product))
    setIsSlugTouched(Boolean(product))
    setVariantFormData(emptyVariantFormData)
    setTemporaryVariants([])
    setEditingVariantClientId(null)
    setUploadError(null)
    setValidationError(null)
    setVariantError(null)
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

  function updateVariantField<Field extends keyof VariantFormData>(
    field: Field,
    value: VariantFormData[Field],
  ) {
    setVariantFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }))
  }

  function handleSaveTemporaryVariant() {
    setVariantError(null)

    const variantPayload = createVariantPayload(variantFormData)

    if (!variantPayload) {
      setVariantError('Taille, couleur et stock positif ou nul sont obligatoires.')
      return
    }

    if (editingVariantClientId) {
      setTemporaryVariants((currentVariants) =>
        currentVariants.map((variant) =>
          variant.clientId === editingVariantClientId
            ? {
                ...variantPayload,
                clientId: editingVariantClientId,
              }
            : variant,
        ),
      )
    } else {
      setTemporaryVariants((currentVariants) => [
        ...currentVariants,
        {
          ...variantPayload,
          clientId: createTemporaryVariantId(),
        },
      ])
    }

    setEditingVariantClientId(null)
    setVariantFormData(emptyVariantFormData)
  }

  function handleEditTemporaryVariant(variant: TemporaryVariant) {
    setVariantError(null)
    setEditingVariantClientId(variant.clientId)
    setVariantFormData(createVariantFormData(variant))
  }

  function handleRemoveTemporaryVariant(clientId: string) {
    setTemporaryVariants((currentVariants) =>
      currentVariants.filter((variant) => variant.clientId !== clientId),
    )

    if (editingVariantClientId === clientId) {
      setEditingVariantClientId(null)
      setVariantFormData(emptyVariantFormData)
    }
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
      setFormData((currentFormData) => ({
        ...currentFormData,
        imageStorageKey: uploadedImage.storageKey,
        imageUrl: uploadedImage.url,
        isImageChanged: true,
      }))
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

    const didSave = await onSubmit(
      payload,
      mode === 'create'
        ? temporaryVariants.map(createVariantPayloadFromTemporaryVariant)
        : [],
    )

    if (mode === 'create' && didSave) {
      setFormData(emptyFormData)
      setIsSlugTouched(false)
      setVariantFormData(emptyVariantFormData)
      setTemporaryVariants([])
      setEditingVariantClientId(null)
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

      {mode === 'create' ? (
        <div className="grid gap-4 rounded-[1rem] border border-stone-200 bg-stone-50 p-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Variantes
            </p>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              Ajoutez les tailles, couleurs, stocks et SKU a creer juste apres le produit.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <FormField
              label="Taille"
              name="variantSizeLabel"
              onChange={(value) => updateVariantField('sizeLabel', value)}
              value={variantFormData.sizeLabel}
            />
            <FormField
              label="Couleur"
              name="variantColorName"
              onChange={(value) => updateVariantField('colorName', value)}
              value={variantFormData.colorName}
            />
            <FormField
              label="Hex couleur"
              name="variantColorHex"
              onChange={(value) => updateVariantField('colorHex', value)}
              value={variantFormData.colorHex}
            />
            <FormField
              label="SKU"
              name="variantSku"
              onChange={(value) => updateVariantField('sku', value)}
              value={variantFormData.sku}
            />
            <FormField
              label="Prix specifique (EUR)"
              min="0"
              name="variantPrice"
              onChange={(value) => updateVariantField('priceEuros', value)}
              step="0.01"
              type="number"
              value={variantFormData.priceEuros}
            />
            <FormField
              label="Stock"
              min="0"
              name="variantStock"
              onChange={(value) => updateVariantField('stockQuantity', value)}
              step="1"
              type="number"
              value={variantFormData.stockQuantity}
            />
            <label className="flex items-center gap-2 rounded-[0.9rem] border border-stone-200 bg-white px-3 py-3 text-sm font-semibold text-blue-950">
              <input
                checked={variantFormData.isActive}
                className="h-4 w-4 accent-emerald-700"
                type="checkbox"
                onChange={(event) =>
                  updateVariantField('isActive', event.currentTarget.checked)
                }
              />
              Variante active
            </label>
          </div>

          {variantError ? (
            <div className="rounded-[1rem] border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
              {variantError}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-[0.95rem] bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
              onClick={handleSaveTemporaryVariant}
            >
              {editingVariantClientId
                ? 'Mettre a jour la variante'
                : 'Ajouter la variante'}
            </button>
            {editingVariantClientId ? (
              <button
                type="button"
                className="rounded-[0.95rem] border border-blue-100 bg-white px-4 py-2.5 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:text-emerald-800"
                onClick={() => {
                  setEditingVariantClientId(null)
                  setVariantFormData(emptyVariantFormData)
                  setVariantError(null)
                }}
              >
                Annuler variante
              </button>
            ) : null}
          </div>

          {temporaryVariants.length > 0 ? (
            <TemporaryVariantsTable
              variants={temporaryVariants}
              onEdit={handleEditTemporaryVariant}
              onRemove={handleRemoveTemporaryVariant}
            />
          ) : (
            <div className="rounded-[0.95rem] border border-dashed border-stone-200 bg-white px-3 py-4 text-center text-sm font-semibold text-stone-400">
              Aucune variante temporaire.
            </div>
          )}
        </div>
      ) : null}

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

type TemporaryVariantsTableProps = {
  onEdit: (variant: TemporaryVariant) => void
  onRemove: (clientId: string) => void
  variants: TemporaryVariant[]
}

function TemporaryVariantsTable({
  onEdit,
  onRemove,
  variants,
}: TemporaryVariantsTableProps) {
  return (
    <div className="overflow-hidden rounded-[1rem] border border-stone-200 bg-white">
      <table className="w-full min-w-[780px] table-fixed border-collapse text-left text-sm">
        <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
          <tr>
            <th className="w-[13%] px-3 py-3">Taille</th>
            <th className="w-[18%] px-3 py-3">Couleur</th>
            <th className="w-[16%] px-3 py-3">SKU</th>
            <th className="w-[15%] px-3 py-3">Prix</th>
            <th className="w-[12%] px-3 py-3">Stock</th>
            <th className="w-[10%] px-3 py-3">Statut</th>
            <th className="w-[16%] px-3 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {variants.map((variant) => (
            <tr key={variant.clientId}>
              <td className="px-3 py-3 font-semibold text-blue-950">
                {variant.sizeLabel}
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-4 w-4 rounded-full border border-stone-200"
                    style={{
                      backgroundColor: variant.colorHex ?? '#f5f5f4',
                    }}
                  />
                  <span className="font-medium text-stone-700">
                    {variant.colorName}
                  </span>
                </div>
              </td>
              <td className="px-3 py-3 text-stone-600">{variant.sku ?? '-'}</td>
              <td className="px-3 py-3 font-semibold text-blue-950">
                {variant.priceCents === null || variant.priceCents === undefined
                  ? 'Prix produit'
                  : `${(variant.priceCents / 100).toFixed(2)} EUR`}
              </td>
              <td className="px-3 py-3 text-stone-600">
                {variant.stockQuantity}
              </td>
              <td className="px-3 py-3 text-stone-600">
                {variant.isActive === false ? 'Inactif' : 'Actif'}
              </td>
              <td className="px-3 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-[0.8rem] border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-950 transition hover:bg-white hover:text-emerald-800"
                    onClick={() => onEdit(variant)}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="rounded-[0.8rem] border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-white"
                    onClick={() => onRemove(variant.clientId)}
                  >
                    Supprimer
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
    imageStorageKey: product.imageStorageKey,
    imageUrl: product.imageUrl,
    isImageChanged: false,
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

  const basePayload = {
    description: normalizeOptionalText(formData.description),
    isActive: formData.isActive,
    name,
    priceCents,
    slug,
  }

  if (mode === 'create') {
    return {
      ...basePayload,
      imageStorageKey: formData.imageStorageKey,
      imageUrl: formData.imageUrl,
    }
  }

  return formData.isImageChanged
    ? {
        ...basePayload,
        imageStorageKey: formData.imageStorageKey,
        imageUrl: formData.imageUrl,
      }
    : basePayload
}

function eurosToCents(value: string): number | null {
  const normalizedValue = value.trim().replace(',', '.')
  const euros = Number(normalizedValue)

  if (!Number.isFinite(euros)) {
    return null
  }

  return Math.round(euros * 100)
}

function optionalEurosToCents(value: string): number | null | undefined {
  const normalizedValue = value.trim().replace(',', '.')

  if (!normalizedValue) {
    return null
  }

  const euros = Number(normalizedValue)

  if (!Number.isFinite(euros) || euros < 0) {
    return undefined
  }

  return Math.round(euros * 100)
}

function createVariantPayload(
  formData: VariantFormData,
): CreateAdminShopProductVariantPayload | null {
  const sizeLabel = formData.sizeLabel.trim()
  const colorName = formData.colorName.trim()
  const stockQuantity = Number(formData.stockQuantity)
  const priceCents = optionalEurosToCents(formData.priceEuros)

  if (
    !sizeLabel ||
    !colorName ||
    !Number.isInteger(stockQuantity) ||
    stockQuantity < 0 ||
    priceCents === undefined
  ) {
    return null
  }

  return {
    colorHex: normalizeOptionalText(formData.colorHex),
    colorName,
    isActive: formData.isActive,
    priceCents,
    sizeLabel,
    sku: normalizeOptionalText(formData.sku),
    stockQuantity,
  }
}

function createVariantFormData(variant: TemporaryVariant): VariantFormData {
  return {
    colorHex: variant.colorHex ?? '',
    colorName: variant.colorName,
    isActive: variant.isActive ?? true,
    priceEuros:
      variant.priceCents === null || variant.priceCents === undefined
        ? ''
        : (variant.priceCents / 100).toFixed(2),
    sizeLabel: variant.sizeLabel,
    sku: variant.sku ?? '',
    stockQuantity: String(variant.stockQuantity),
  }
}

function createVariantPayloadFromTemporaryVariant(
  variant: TemporaryVariant,
): CreateAdminShopProductVariantPayload {
  return {
    colorHex: variant.colorHex,
    colorName: variant.colorName,
    isActive: variant.isActive,
    priceCents: variant.priceCents,
    sizeLabel: variant.sizeLabel,
    sku: variant.sku,
    stockQuantity: variant.stockQuantity,
  }
}

function createTemporaryVariantId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  return `variant-${Date.now()}-${Math.random().toString(36).slice(2)}`
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
