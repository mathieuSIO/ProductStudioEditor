import { useEffect, useRef, useState } from 'react'

import {
  getCenteredLogoPosition,
  getDefaultLogoSize,
  getLogoManualControls,
  getLogoSizeFromWidth,
  normalizeLogoManualControls,
} from '../constants/logoPlacement'
import {
  acceptedLogoMimeTypes,
  maxLogoFileSizeInBytes,
} from '../constants/logoUpload'
import { mockProducts } from '../data/mockProducts'
import type {
  DesignElement,
  EditorElementId,
  LogoManualControls,
  Product,
  ProductColor,
  ProductColorId,
  ProductId,
  ProductSize,
  ProductViewId,
} from '../types'
import { createUploadedLogoFromFile } from '../utils/createUploadedLogoFromFile'

const initialProduct = mockProducts[0]
const initialColor = initialProduct?.colors[0]

const initialElementsByView = {
  front: [],
  back: [],
  custom: [],
} satisfies Record<ProductViewId, DesignElement[]>

const initialSelectionByView = {
  front: null,
  back: null,
  custom: null,
} satisfies Record<ProductViewId, EditorElementId | null>

type QuantitiesByProduct = Record<ProductId, Record<string, number>>

const initialQuantitiesByProduct = mockProducts.reduce<QuantitiesByProduct>(
  (accumulator, product) => {
    accumulator[product.id] = product.sizes.reduce<Record<string, number>>(
      (sizeAccumulator, size) => {
        sizeAccumulator[size] = 0
        return sizeAccumulator
      },
      {},
    )

    return accumulator
  },
  {
    cap: {},
    other: {},
    polo: {},
    sweatshirt: {},
    tshirt: {},
  },
)

export function useEditorStudio() {
  const [selectedProductId, setSelectedProductId] = useState(
    initialProduct?.id ?? '',
  )
  const [selectedColorId, setSelectedColorId] = useState<ProductColorId>(
    initialColor?.id ?? 'white',
  )
  const [elementsByView, setElementsByView] = useState<
    Record<ProductViewId, DesignElement[]>
  >(initialElementsByView)
  const [logoErrorMessage, setLogoErrorMessage] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<ProductViewId>('front')
  const [customPlacement, setCustomPlacement] = useState('')
  const [quantitiesByProduct, setQuantitiesByProduct] = useState<QuantitiesByProduct>(
    initialQuantitiesByProduct,
  )
  const [selectedElementIdByView, setSelectedElementIdByView] =
    useState<Record<ProductViewId, EditorElementId | null>>(
      initialSelectionByView,
    )

  const selectedProduct = getSelectedProduct(selectedProductId)
  const selectedColor = getSelectedColor(selectedProduct, selectedColorId)
  const availableViews = getAvailableViews(selectedColor)
  const resolvedActiveView = getResolvedActiveView(activeView, availableViews)
  const activeProductView =
    selectedColor && resolvedActiveView !== 'custom'
      ? selectedColor.views[resolvedActiveView] ?? null
      : null
  const activeLogoElements = elementsByView[resolvedActiveView]
  const selectedElementId = selectedElementIdByView[resolvedActiveView]
  const activeLogoElement = getSelectedElement(
    activeLogoElements,
    selectedElementId,
  )
  const selectedProductQuantities =
    quantitiesByProduct[selectedProduct?.id ?? initialProduct.id] ?? {}
  const totalQuantity = getTotalQuantityForProduct(
    selectedProduct,
    selectedProductQuantities,
  )
  const logoControls = activeLogoElement
    ? getLogoManualControls(
        activeLogoElement.position,
        activeLogoElement.size,
      )
    : null
  const elementsByViewRef = useRef(elementsByView)

  useEffect(() => {
    elementsByViewRef.current = elementsByView
  }, [elementsByView])

  useEffect(() => {
    if (!resolvedActiveView || !selectedElementId) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return
      }

      setSelectedElementIdByView((currentSelectionByView) => ({
        ...currentSelectionByView,
        [resolvedActiveView]: null,
      }))
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [resolvedActiveView, selectedElementId])

  useEffect(() => {
    return () => {
      Object.values(elementsByViewRef.current).forEach((elements) => {
        elements.forEach((element) => {
          URL.revokeObjectURL(element.asset.src)
        })
      })
    }
  }, [])

  async function handleLogoFileSelect(file: File | null) {
    if (!file || !activeProductView || !resolvedActiveView) {
      return
    }

    const logoFileError = validateLogoFile(file)

    if (logoFileError) {
      setLogoErrorMessage(logoFileError)
      return
    }

    try {
      const uploadedLogo = await createUploadedLogoFromFile(file)
      const nextElementId = createEditorElementId()
      const nextSize = getDefaultLogoSize(
        (uploadedLogo.width ?? 1) / (uploadedLogo.height ?? 1),
        activeProductView.printableArea.width /
          activeProductView.printableArea.height,
      )

      setElementsByView((currentElementsByView) =>
        appendElementToView(currentElementsByView, resolvedActiveView, {
          asset: uploadedLogo,
          id: nextElementId,
          position: getCenteredLogoPosition(nextSize),
          size: nextSize,
          type: 'image',
        }),
      )
      setLogoErrorMessage(null)
      setSelectedElementIdByView((currentSelectionByView) => ({
        ...currentSelectionByView,
        [resolvedActiveView]: nextElementId,
      }))
    } catch {
      setLogoErrorMessage(
        file.type === 'application/pdf'
          ? "Impossible de generer l'aperçu de ce PDF. Essaie avec un autre PDF ou exporte ton logo en PNG ou SVG."
          : "Impossible de lire ce fichier image. Essaie avec un autre logo.",
      )
    }
  }

  function handleLogoRemove() {
    if (!resolvedActiveView || !selectedElementId) {
      return
    }

    setElementsByView((currentElementsByView) =>
      removeElementFromView(
        currentElementsByView,
        resolvedActiveView,
        selectedElementId,
      ),
    )
    setSelectedElementIdByView((currentSelectionByView) => ({
      ...currentSelectionByView,
      [resolvedActiveView]: null,
    }))
    setLogoErrorMessage(null)
  }

  function handleLogoControlsChange(controls: LogoManualControls) {
    if (!activeLogoElement || !resolvedActiveView || !selectedElementId) {
      return
    }

    const currentAspectRatio =
      activeLogoElement.size.height > 0
        ? activeLogoElement.size.width / activeLogoElement.size.height
        : 1
    const normalizedControls = normalizeLogoManualControls(
      controls,
      activeLogoElement.size,
    )
    const nextSize = getLogoSizeFromWidth(
      normalizedControls.width,
      currentAspectRatio,
    )

    setElementsByView((currentElementsByView) =>
      updateElementInView(
        currentElementsByView,
        resolvedActiveView,
        selectedElementId,
        (currentElement) => ({
          ...currentElement,
          position: {
            x: normalizedControls.x,
            y: normalizedControls.y,
          },
          size: nextSize,
        }),
      ),
    )
  }

  function handleLogoPositionChange(position: DesignElement['position']) {
    if (!resolvedActiveView || !selectedElementId) {
      return
    }

    setElementsByView((currentElementsByView) =>
      updateElementInView(
        currentElementsByView,
        resolvedActiveView,
        selectedElementId,
        (currentElement) => ({
          ...currentElement,
          position,
        }),
      ),
    )
  }

  function handleLogoSizeChange(size: DesignElement['size']) {
    if (!resolvedActiveView || !selectedElementId) {
      return
    }

    setElementsByView((currentElementsByView) =>
      updateElementInView(
        currentElementsByView,
        resolvedActiveView,
        selectedElementId,
        (currentElement) => ({
          ...currentElement,
          size,
        }),
      ),
    )
  }

  function handleElementSelect(nextElementId: EditorElementId | null) {
    if (!resolvedActiveView) {
      return
    }

    setSelectedElementIdByView((currentSelectionByView) => ({
      ...currentSelectionByView,
      [resolvedActiveView]: nextElementId,
    }))
  }

  function handleProductSelect(productId: Product['id']) {
    const nextProduct = mockProducts.find((product) => product.id === productId)

    if (!nextProduct) {
      return
    }

    const nextColor = nextProduct.colors[0]
    const nextView = getAvailableViews(nextColor)[0] ?? 'front'

    setSelectedProductId(nextProduct.id)
    setSelectedColorId(nextColor?.id ?? 'white')
    setActiveView(nextView)
  }

  function handleColorSelect(colorId: ProductColorId) {
    if (!selectedProduct) {
      return
    }

    const nextColor = selectedProduct.colors.find((color) => color.id === colorId)

    if (!nextColor) {
      return
    }

    const nextView = getAvailableViews(nextColor)[0] ?? 'front'

    setSelectedColorId(nextColor.id)
    setActiveView(
      activeView === 'custom' || nextColor.views[activeView]
        ? activeView
        : nextView,
    )
  }

  function handleQuantityChange(size: ProductSize, value: number) {
    if (!selectedProduct) {
      return
    }

    const nextValue = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0

    setQuantitiesByProduct((currentQuantitiesByProduct) => ({
      ...currentQuantitiesByProduct,
      [selectedProduct.id]: {
        ...currentQuantitiesByProduct[selectedProduct.id],
        [size]: nextValue,
      },
    }))
  }

  return {
    activeLogoElement,
    activeLogoElements,
    activeProductView,
    activeView: resolvedActiveView ?? activeView,
    availableViews,
    customPlacement,
    handleElementSelect,
    handleColorSelect,
    handleLogoControlsChange,
    handleLogoFileSelect,
    handleLogoPositionChange,
    handleLogoRemove,
    handleLogoSizeChange,
    handleProductSelect,
    handleQuantityChange,
    logoControls,
    logoErrorMessage,
    products: mockProducts,
    quantitiesByProduct: selectedProductQuantities,
    selectedColor,
    selectedColorId: selectedColor?.id ?? selectedColorId,
    selectedElementId,
    selectedProduct,
    setCustomPlacement,
    setActiveView,
    totalQuantity,
  }
}

function getAvailableViews(color: ProductColor | undefined) {
  if (!color) {
    return [] as ProductViewId[]
  }

  const baseViews = (Object.keys(color.views) as ProductViewId[]).filter(
    (viewId) => Boolean(color.views[viewId]),
  )

  return [...baseViews, 'custom'] as ProductViewId[]
}

function isAcceptedLogoMimeType(
  mimeType: string,
): mimeType is (typeof acceptedLogoMimeTypes)[number] {
  return acceptedLogoMimeTypes.some(
    (acceptedMimeType) => acceptedMimeType === mimeType,
  )
}

function getSelectedProduct(productId: ProductId) {
  return mockProducts.find((product) => product.id === productId) ?? initialProduct
}

function getSelectedColor(
  product: Product | undefined,
  colorId: ProductColorId,
) {
  return product?.colors.find((color) => color.id === colorId) ?? product?.colors[0]
}

function getResolvedActiveView(
  activeView: ProductViewId,
  availableViews: ProductViewId[],
): ProductViewId {
  return availableViews.includes(activeView) ? activeView : (availableViews[0] ?? 'front')
}

function getTotalQuantityForProduct(
  product: Product | undefined,
  quantitiesBySize: Record<string, number>,
) {
  if (!product) {
    return 0
  }

  return product.sizes.reduce(
    (total, size) => total + (quantitiesBySize[size] ?? 0),
    0,
  )
}

function validateLogoFile(file: File) {
  if (!isAcceptedLogoMimeType(file.type)) {
    return 'Fichier invalide. Utilise un logo PNG, JPG, JPEG, SVG ou PDF.'
  }

  if (file.size > maxLogoFileSizeInBytes) {
    return 'Fichier trop lourd. Utilise un logo de 5 Mo maximum.'
  }

  return null
}

function getSelectedElement(
  elements: DesignElement[],
  selectedElementId: EditorElementId | null,
) {
  if (!selectedElementId) {
    return null
  }

  return elements.find((element) => element.id === selectedElementId) ?? null
}

function appendElementToView(
  elementsByView: Record<ProductViewId, DesignElement[]>,
  viewId: ProductViewId,
  element: DesignElement,
) {
  return {
    ...elementsByView,
    [viewId]: [...elementsByView[viewId], element],
  }
}

function updateElementInView(
  elementsByView: Record<ProductViewId, DesignElement[]>,
  viewId: ProductViewId,
  elementId: EditorElementId,
  updater: (element: DesignElement) => DesignElement,
) {
  return {
    ...elementsByView,
    [viewId]: elementsByView[viewId].map((element) =>
      element.id === elementId ? updater(element) : element,
    ),
  }
}

function removeElementFromView(
  elementsByView: Record<ProductViewId, DesignElement[]>,
  viewId: ProductViewId,
  elementId: EditorElementId,
) {
  return {
    ...elementsByView,
    [viewId]: elementsByView[viewId].filter((element) => {
      if (element.id === elementId) {
        URL.revokeObjectURL(element.asset.src)
        return false
      }

      return true
    }),
  }
}

let nextEditorElementId = 0

function createEditorElementId(): EditorElementId {
  nextEditorElementId += 1
  return `logo-${nextEditorElementId}`
}
