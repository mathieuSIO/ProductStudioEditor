import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { PanelCard } from '../../../components/ui/PanelCard'
import { useAuth } from '../../auth'
import {
  AdminShopProductsApiError,
  createAdminShopProduct,
  fetchAdminShopProducts,
  updateAdminShopProduct,
  updateAdminShopProductStatus,
} from '../api/adminShopProductsApi'
import {
  AdminShopProductForm,
  type AdminShopProductFormPayload,
} from '../components/AdminShopProductForm'
import { AdminShopProductsTable } from '../components/AdminShopProductsTable'
import type { AdminShopProduct } from '../types/admin.types'

export function AdminShopProductsPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [products, setProducts] = useState<AdminShopProduct[]>([])
  const [editingProduct, setEditingProduct] = useState<AdminShopProduct | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updatingProductId, setUpdatingProductId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [errorStatus, setErrorStatus] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    void loadProducts()
  }, [])

  async function loadProducts() {
    setIsLoading(true)
    setError(null)
    setErrorStatus(null)

    try {
      const loadedProducts = await fetchAdminShopProducts()
      setProducts(
        [...loadedProducts].sort((firstProduct, secondProduct) =>
          secondProduct.createdAt.localeCompare(firstProduct.createdAt),
        ),
      )
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Les produits boutique sont indisponibles.',
      )
      setErrorStatus(
        loadError instanceof AdminShopProductsApiError
          ? loadError.status
          : null,
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function handleLogin() {
    navigate('/login')
  }

  async function handleCreateProduct(
    payload: AdminShopProductFormPayload,
  ): Promise<boolean> {
    setFormError(null)
    setSuccess(null)
    setIsCreating(true)

    try {
      await createAdminShopProduct({
        description: payload.description,
        imageUrl: payload.imageUrl,
        isActive: payload.isActive,
        name: requireString(payload.name),
        priceCents: requireNumber(payload.priceCents),
        slug: requireString(payload.slug),
      })
      setSuccess('Produit boutique cree.')
      await loadProducts()
      return true
    } catch (createError) {
      setFormError(
        createError instanceof Error
          ? createError.message
          : "Le produit boutique n'a pas pu etre cree.",
      )
      return false
    } finally {
      setIsCreating(false)
    }
  }

  async function handleUpdateProduct(
    payload: AdminShopProductFormPayload,
  ): Promise<boolean> {
    if (!editingProduct) {
      return false
    }

    setFormError(null)
    setSuccess(null)
    setIsUpdating(true)

    try {
      await updateAdminShopProduct(editingProduct.id, payload)
      setEditingProduct(null)
      setSuccess('Produit boutique modifie.')
      await loadProducts()
      return true
    } catch (updateError) {
      setFormError(
        updateError instanceof Error
          ? updateError.message
          : "Le produit boutique n'a pas pu etre modifie.",
      )
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleToggleStatus(product: AdminShopProduct) {
    setFormError(null)
    setSuccess(null)
    setUpdatingProductId(product.id)

    try {
      await updateAdminShopProductStatus(product.id, !product.isActive)
      setSuccess(
        product.isActive
          ? 'Produit boutique desactive.'
          : 'Produit boutique reactive.',
      )
      await loadProducts()
    } catch (updateError) {
      setFormError(
        updateError instanceof Error
          ? updateError.message
          : "Le statut du produit boutique n'a pas pu etre modifie.",
      )
    } finally {
      setUpdatingProductId(null)
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
              Produits Boutique
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Gere les produits prets a vendre dans la boutique publique.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-[0.95rem] border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-white hover:text-emerald-800"
              onClick={() => navigate('/admin')}
            >
              Admin
            </button>
            <button
              type="button"
              className="rounded-[0.95rem] border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-white hover:text-emerald-800"
              onClick={() => navigate('/admin/orders')}
            >
              Commandes
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
        eyebrow={editingProduct ? 'Modification' : 'Creation'}
        title={
          editingProduct
            ? `Modifier ${editingProduct.name}`
            : 'Creer un produit'
        }
        description="Le prix est saisi en euros puis envoye en centimes au backend."
      >
        <AdminShopProductForm
          isSaving={editingProduct ? isUpdating : isCreating}
          mode={editingProduct ? 'edit' : 'create'}
          product={editingProduct}
          onCancel={
            editingProduct
              ? () => {
                  setEditingProduct(null)
                  setFormError(null)
                }
              : undefined
          }
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
        />
        <Feedback error={formError} success={success} />
      </PanelCard>

      <PanelCard
        eyebrow="Back office"
        title="Produits existants"
        description="Activez ou desactivez les produits sans supprimer leur historique."
        aside={
          <div className="rounded-[0.95rem] border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            {products.length} produit{products.length > 1 ? 's' : ''}
          </div>
        }
      >
        {isLoading ? (
          <StateMessage
            title="Chargement des produits boutique"
            description="Recuperation de la liste admin."
          />
        ) : error ? (
          <StateMessage
            title="Produits boutique indisponibles"
            description={error}
            tone="error"
            actionLabel={errorStatus === 401 ? 'Se reconnecter' : 'Retour'}
            onAction={errorStatus === 401 ? handleLogin : () => navigate('/admin')}
          />
        ) : products.length === 0 ? (
          <StateMessage
            title="Aucun produit boutique"
            description="Les produits crees apparaitront ici."
          />
        ) : (
          <AdminShopProductsTable
            editingProductId={editingProduct?.id ?? null}
            products={products}
            updatingProductId={updatingProductId}
            onEdit={(product) => {
              setEditingProduct(product)
              setFormError(null)
              setSuccess(null)
            }}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </PanelCard>
    </section>
  )
}

type FeedbackProps = {
  error: string | null
  success: string | null
}

function Feedback({ error, success }: FeedbackProps) {
  if (error) {
    return (
      <div className="mt-4 rounded-[1rem] border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
        {error}
      </div>
    )
  }

  if (success) {
    return (
      <div className="mt-4 rounded-[1rem] border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800">
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

function requireString(value: string | undefined): string {
  if (!value) {
    throw new Error('Le formulaire produit est invalide.')
  }

  return value
}

function requireNumber(value: number | undefined): number {
  if (typeof value !== 'number') {
    throw new Error('Le formulaire produit est invalide.')
  }

  return value
}
