import type {
  DesignElement,
  EditorStudioConfiguration,
  ProductSize,
  ProductViewId,
} from '../../editor/types'
import type {
  CartDesignViewSnapshot,
  CartItem,
  CartLogoPreviewPersistence,
  CartQuantitiesBySize,
} from '../types'

export type CreateCartItemFromEditorInput = EditorStudioConfiguration

export function createCartItemFromEditor(
  input: CreateCartItemFromEditorInput,
): CartItem {
  const now = new Date().toISOString()

  return {
    color: {
      id: input.color.id,
      label: input.color.label,
      swatchHex: input.color.swatchHex,
    },
    createdAt: now,
    design: {
      customPlacement: input.customPlacement.trim(),
      views: createDesignViewSnapshots(input.elementsByView),
    },
    // TODO: upload preview finale vers un stockage persistant et renseigner l'URL durable ici.
    finalPreviewUrl: null,
    id: createCartItemId(),
    pricing: {
      grandTotal: input.pricing.grandTotal,
      logoLines: input.pricing.logoLines,
      logosCount: input.pricing.logosCount,
      printTotal: input.pricing.printTotal,
      textileTotal: input.pricing.textileTotal,
      textileUnitPrice: input.pricing.textileUnitPrice,
      totalQuantity: input.pricing.totalQuantity,
    },
    product: {
      category: input.product.category,
      id: input.product.id,
      name: input.product.name,
    },
    quantities: createQuantitiesSnapshot(input.quantities),
    updatedAt: now,
  }
}

function createDesignViewSnapshots(
  elementsByView: Record<ProductViewId, DesignElement[]>,
): CartDesignViewSnapshot[] {
  return Object.entries(elementsByView).map(([viewId, elements]) => ({
    logos: elements.map((element) => ({
      id: element.id,
      mimeType: element.asset.mimeType,
      name: element.asset.name,
      originalFileSize: element.asset.size,
      position: element.position,
      previewPersistence: getPreviewPersistence(element.asset.src),
      previewUrl: element.asset.src,
      printFormat: element.printFormat,
      size: element.size,
      source: 'uploaded-file',
    })),
    viewId: viewId as ProductViewId,
  }))
}

function createQuantitiesSnapshot(
  quantities: Partial<Record<ProductSize, number>>,
): CartQuantitiesBySize {
  return Object.entries(quantities).reduce<CartQuantitiesBySize>(
    (snapshot, [size, quantity]) => {
      const normalizedQuantity =
        typeof quantity === 'number' && Number.isFinite(quantity)
          ? Math.max(0, Math.floor(quantity))
          : 0

      if (normalizedQuantity > 0) {
        snapshot[size as ProductSize] = normalizedQuantity
      }

      return snapshot
    },
    {},
  )
}

function getPreviewPersistence(src: string): CartLogoPreviewPersistence {
  return src.startsWith('blob:') ? 'temporary-object-url' : 'persistent-url'
}

function createCartItemId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  return `cart-item-${Date.now()}-${Math.random().toString(36).slice(2)}`
}
