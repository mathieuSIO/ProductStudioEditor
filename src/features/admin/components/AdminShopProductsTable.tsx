import { formatEuro } from '../../../shared/formatters/formatEuro'
import { resolveShopProductImageUrl } from '../api/adminShopProductsApi'
import type { AdminShopProduct } from '../types/admin.types'

type AdminShopProductsTableProps = {
  editingProductId: number | null
  onEdit: (product: AdminShopProduct) => void
  onOpenGallery: (product: AdminShopProduct) => void
  onOpenVariants: (product: AdminShopProduct) => void
  onToggleStatus: (product: AdminShopProduct) => void
  products: AdminShopProduct[]
  updatingProductId: number | null
}

export function AdminShopProductsTable({
  editingProductId,
  onEdit,
  onOpenGallery,
  onOpenVariants,
  onToggleStatus,
  products,
  updatingProductId,
}: AdminShopProductsTableProps) {
  return (
    <div className="overflow-hidden rounded-[1.1rem] border border-stone-200 bg-white">
      <table className="w-full min-w-[980px] table-fixed border-collapse text-left text-sm">
        <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
          <tr>
            <th className="w-[10%] px-4 py-3">Image</th>
            <th className="w-[21%] px-4 py-3">Nom</th>
            <th className="w-[18%] px-4 py-3">Slug</th>
            <th className="w-[12%] px-4 py-3">Prix</th>
            <th className="w-[11%] px-4 py-3">Statut</th>
            <th className="w-[14%] px-4 py-3">Creation</th>
            <th className="w-[14%] px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {products.map((product) => (
            <tr key={product.id} className="transition hover:bg-blue-50/60">
              <td className="px-4 py-3">
                <ProductImage imageUrl={product.imageUrl} name={product.name} />
              </td>
              <td className="px-4 py-3">
                <p className="font-semibold text-blue-950">{product.name}</p>
                {product.description ? (
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-500">
                    {product.description}
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-3 font-medium text-stone-600">
                {product.slug}
              </td>
              <td className="px-4 py-3 font-semibold text-blue-950">
                {formatEuro(product.priceCents / 100)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge isActive={product.isActive} />
              </td>
              <td className="px-4 py-3 text-stone-600">
                {formatDate(product.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-[0.85rem] border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-950 transition hover:border-emerald-200 hover:bg-white hover:text-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
                    disabled={editingProductId === product.id}
                    onClick={() => onEdit(product)}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="rounded-[0.85rem] border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:border-blue-100 hover:bg-white hover:text-blue-950"
                    onClick={() => onOpenGallery(product)}
                  >
                    Galerie
                  </button>
                  <button
                    type="button"
                    className="rounded-[0.85rem] border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:border-blue-100 hover:bg-white hover:text-blue-950"
                    onClick={() => onOpenVariants(product)}
                  >
                    Variantes
                  </button>
                  <button
                    type="button"
                    className={`rounded-[0.85rem] px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400 ${
                      product.isActive
                        ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-white'
                        : 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-white'
                    }`}
                    disabled={updatingProductId === product.id}
                    onClick={() => onToggleStatus(product)}
                  >
                    {getToggleLabel(product, updatingProductId)}
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

type ProductImageProps = {
  imageUrl: string | null
  name: string
}

function ProductImage({ imageUrl, name }: ProductImageProps) {
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
      alt={name}
      className="h-16 w-16 rounded-[0.85rem] border border-stone-200 object-cover"
      src={resolvedImageUrl}
    />
  )
}

function StatusBadge({ isActive }: Pick<AdminShopProduct, 'isActive'>) {
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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getToggleLabel(
  product: AdminShopProduct,
  updatingProductId: number | null,
): string {
  if (updatingProductId === product.id) {
    return '...'
  }

  return product.isActive ? 'Desactiver' : 'Reactiver'
}
