import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { PanelCard } from '../../../components/ui/PanelCard'
import { formatEuro } from '../../../shared/formatters/formatEuro'
import { useAuth } from '../../auth'
import {
  AdminShopProductsApiError,
  createAdminShopProductVariant,
  fetchAdminShopProductVariants,
  fetchAdminShopProducts,
  updateAdminShopProductVariant,
  updateAdminShopProductVariantStatus,
} from '../api/adminShopProductsApi'
import type {
  AdminShopProduct,
  AdminShopProductVariant,
  CreateAdminShopProductVariantPayload,
} from '../types/admin.types'

type VariantFormData = {
  colorHex: string
  colorName: string
  isActive: boolean
  priceEuros: string
  sizeLabel: string
  sku: string
  stockQuantity: string
}

const emptyFormData: VariantFormData = {
  colorHex: '',
  colorName: '',
  isActive: true,
  priceEuros: '',
  sizeLabel: '',
  sku: '',
  stockQuantity: '0',
}

export function AdminShopProductVariantsPage() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const { logout } = useAuth()
  const parsedProductId = parseProductId(productId)
  const [products, setProducts] = useState<AdminShopProduct[]>([])
  const [variants, setVariants] = useState<AdminShopProductVariant[]>([])
  const [formData, setFormData] = useState<VariantFormData>(emptyFormData)
  const [editingVariant, setEditingVariant] =
    useState<AdminShopProductVariant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [updatingVariantId, setUpdatingVariantId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const product = useMemo(
    () =>
      parsedProductId === null
        ? null
        : products.find((currentProduct) => currentProduct.id === parsedProductId) ??
          null,
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
      const [loadedProducts, loadedVariants] = await Promise.all([
        fetchAdminShopProducts(),
        fetchAdminShopProductVariants(requestedProductId),
      ])
      setProducts(loadedProducts)
      setVariants(sortVariants(loadedVariants))
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Les variantes boutique sont indisponibles.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function loadVariants(requestedProductId: number) {
    const loadedVariants = await fetchAdminShopProductVariants(requestedProductId)
    setVariants(sortVariants(loadedVariants))
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function updateFormField<Field extends keyof VariantFormData>(
    field: Field,
    value: VariantFormData[Field],
  ) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }))
  }

  function handleEditVariant(variant: AdminShopProductVariant) {
    setEditingVariant(variant)
    setFormData(createFormDataFromVariant(variant))
    setFormError(null)
    setSuccess(null)
  }

  function handleCancelEdit() {
    setEditingVariant(null)
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

    const payload = createVariantPayload(formData)

    if (!payload) {
      setFormError('Taille, couleur et stock positif ou nul sont obligatoires.')
      return
    }

    setIsSaving(true)

    try {
      if (editingVariant) {
        await updateAdminShopProductVariant(
          parsedProductId,
          editingVariant.id,
          payload,
        )
        setSuccess('Variante modifiee.')
      } else {
        await createAdminShopProductVariant(parsedProductId, payload)
        setSuccess('Variante creee.')
      }

      setEditingVariant(null)
      setFormData(emptyFormData)
      await loadVariants(parsedProductId)
    } catch (saveError) {
      setFormError(formatVariantError(saveError))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggleStatus(variant: AdminShopProductVariant) {
    if (parsedProductId === null) {
      return
    }

    setFormError(null)
    setSuccess(null)
    setUpdatingVariantId(variant.id)

    try {
      await updateAdminShopProductVariantStatus(
        parsedProductId,
        variant.id,
        !variant.isActive,
      )
      setSuccess(variant.isActive ? 'Variante desactivee.' : 'Variante reactivee.')
      await loadVariants(parsedProductId)
    } catch (statusError) {
      setFormError(formatVariantError(statusError))
    } finally {
      setUpdatingVariantId(null)
    }
  }

  return (
    <section className="grid min-w-0 gap-4">
      <div className="rounded-[1.25rem] border border-stone-200 bg-white px-4 py-5 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.28)] sm:px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Administration
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">
              Variantes produit
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              {product
                ? `Gerez les tailles, couleurs, stocks et SKU de ${product.name}.`
                : 'Gerez les tailles, couleurs, stocks et SKU du produit boutique.'}
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
        eyebrow={editingVariant ? 'Modification' : 'Creation'}
        title={editingVariant ? 'Modifier la variante' : 'Creer une variante'}
        description="Le prix specifique est optionnel. Laissez le champ vide pour utiliser le prix du produit."
      >
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <FormField
              label="Taille"
              name="sizeLabel"
              onChange={(value) => updateFormField('sizeLabel', value)}
              required
              value={formData.sizeLabel}
            />
            <FormField
              label="Couleur"
              name="colorName"
              onChange={(value) => updateFormField('colorName', value)}
              required
              value={formData.colorName}
            />
            <FormField
              label="Hex couleur"
              name="colorHex"
              onChange={(value) => updateFormField('colorHex', value)}
              value={formData.colorHex}
            />
            <FormField
              label="SKU"
              name="sku"
              onChange={(value) => updateFormField('sku', value)}
              value={formData.sku}
            />
            <FormField
              label="Prix specifique (EUR)"
              min="0"
              name="priceEuros"
              onChange={(value) => updateFormField('priceEuros', value)}
              step="0.01"
              type="number"
              value={formData.priceEuros}
            />
            <FormField
              label="Stock"
              min="0"
              name="stockQuantity"
              onChange={(value) => updateFormField('stockQuantity', value)}
              required
              step="1"
              type="number"
              value={formData.stockQuantity}
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
              Variante active
            </label>
          </div>

          <Feedback error={formError} success={success} />

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-[0.95rem] bg-blue-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-400"
              disabled={isSaving}
            >
              {isSaving
                ? 'Enregistrement...'
                : editingVariant
                  ? 'Enregistrer les modifications'
                  : 'Creer la variante'}
            </button>
            {editingVariant ? (
              <button
                type="button"
                className="rounded-[0.95rem] border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-white hover:text-emerald-800"
                disabled={isSaving}
                onClick={handleCancelEdit}
              >
                Annuler
              </button>
            ) : null}
          </div>
        </form>
      </PanelCard>

      <PanelCard
        eyebrow="Stock"
        title="Variantes existantes"
        description="Desactivez une variante pour la retirer de la vente sans perdre son historique."
        aside={
          <div className="rounded-[0.95rem] border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            {variants.length} variante{variants.length > 1 ? 's' : ''}
          </div>
        }
      >
        {isLoading ? (
          <StateMessage
            title="Chargement des variantes"
            description="Recuperation de la liste admin."
          />
        ) : error ? (
          <StateMessage
            title="Variantes indisponibles"
            description={error}
            tone="error"
            actionLabel="Retour aux produits"
            onAction={() => navigate('/admin/shop-products')}
          />
        ) : variants.length === 0 ? (
          <StateMessage
            title="Aucune variante"
            description="Les variantes creees apparaitront ici."
          />
        ) : (
          <VariantsTable
            productPriceCents={product?.priceCents ?? null}
            updatingVariantId={updatingVariantId}
            variants={variants}
            onEdit={handleEditVariant}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </PanelCard>
    </section>
  )
}

type VariantsTableProps = {
  onEdit: (variant: AdminShopProductVariant) => void
  onToggleStatus: (variant: AdminShopProductVariant) => void
  productPriceCents: number | null
  updatingVariantId: number | null
  variants: AdminShopProductVariant[]
}

function VariantsTable({
  onEdit,
  onToggleStatus,
  productPriceCents,
  updatingVariantId,
  variants,
}: VariantsTableProps) {
  return (
    <div className="overflow-hidden rounded-[1.1rem] border border-stone-200 bg-white">
      <table className="w-full min-w-[980px] table-fixed border-collapse text-left text-sm">
        <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
          <tr>
            <th className="w-[10%] px-4 py-3">Taille</th>
            <th className="w-[19%] px-4 py-3">Couleur</th>
            <th className="w-[15%] px-4 py-3">SKU</th>
            <th className="w-[14%] px-4 py-3">Prix</th>
            <th className="w-[10%] px-4 py-3">Stock</th>
            <th className="w-[12%] px-4 py-3">Statut</th>
            <th className="w-[20%] px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {variants.map((variant) => (
            <tr key={variant.id} className="transition hover:bg-blue-50/60">
              <td className="px-4 py-3 font-semibold text-blue-950">
                {variant.sizeLabel}
              </td>
              <td className="px-4 py-3">
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
              <td className="px-4 py-3 text-stone-600">{variant.sku ?? '-'}</td>
              <td className="px-4 py-3 font-semibold text-blue-950">
                {formatVariantPrice(variant, productPriceCents)}
              </td>
              <td className="px-4 py-3 text-stone-600">
                {variant.stockQuantity}
              </td>
              <td className="px-4 py-3">
                <StatusBadge isActive={variant.isActive} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-[0.85rem] border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-white hover:text-emerald-800"
                    onClick={() => onEdit(variant)}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    className={`rounded-[0.85rem] px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400 ${
                      variant.isActive
                        ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-white'
                        : 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-white'
                    }`}
                    disabled={updatingVariantId === variant.id}
                    onClick={() => onToggleStatus(variant)}
                  >
                    {getToggleLabel(variant, updatingVariantId)}
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

function StatusBadge({ isActive }: Pick<AdminShopProductVariant, 'isActive'>) {
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

function createFormDataFromVariant(
  variant: AdminShopProductVariant,
): VariantFormData {
  return {
    colorHex: variant.colorHex ?? '',
    colorName: variant.colorName,
    isActive: variant.isActive,
    priceEuros:
      variant.priceCents === null ? '' : (variant.priceCents / 100).toFixed(2),
    sizeLabel: variant.sizeLabel,
    sku: variant.sku ?? '',
    stockQuantity: String(variant.stockQuantity),
  }
}

function createVariantPayload(
  formData: VariantFormData,
): CreateAdminShopProductVariantPayload | null {
  const sizeLabel = formData.sizeLabel.trim()
  const colorName = formData.colorName.trim()
  const stockQuantity = Number(formData.stockQuantity)
  const priceCents = eurosToCents(formData.priceEuros)

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

function eurosToCents(value: string): number | null | undefined {
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

function normalizeOptionalText(value: string): string | null {
  const normalizedValue = value.trim()

  return normalizedValue.length > 0 ? normalizedValue : null
}

function formatVariantPrice(
  variant: AdminShopProductVariant,
  productPriceCents: number | null,
): string {
  if (variant.priceCents !== null) {
    return formatEuro(variant.priceCents / 100)
  }

  return productPriceCents === null
    ? 'Prix produit'
    : `Prix produit (${formatEuro(productPriceCents / 100)})`
}

function getToggleLabel(
  variant: AdminShopProductVariant,
  updatingVariantId: number | null,
): string {
  if (updatingVariantId === variant.id) {
    return '...'
  }

  return variant.isActive ? 'Desactiver' : 'Reactiver'
}

function sortVariants(
  variants: AdminShopProductVariant[],
): AdminShopProductVariant[] {
  return [...variants].sort((firstVariant, secondVariant) => {
    const sizeComparison = firstVariant.sizeLabel.localeCompare(
      secondVariant.sizeLabel,
    )

    return sizeComparison === 0
      ? firstVariant.colorName.localeCompare(secondVariant.colorName)
      : sizeComparison
  })
}

function parseProductId(value: string | undefined): number | null {
  if (!value) {
    return null
  }

  const parsedValue = Number(value)

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null
}

function formatVariantError(error: unknown): string {
  if (error instanceof AdminShopProductsApiError && error.status === 409) {
    return 'Une variante avec cette taille et cette couleur existe deja.'
  }

  return error instanceof Error
    ? error.message
    : "L'operation sur la variante n'a pas pu etre effectuee."
}
