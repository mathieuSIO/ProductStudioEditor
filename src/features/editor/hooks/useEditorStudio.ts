import { useEffect, useMemo, useRef, useState } from 'react'

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
  ProductViewId,
} from '../types'
import { createUploadedLogoFromFile } from '../utils/createUploadedLogoFromFile'

const initialProduct = mockProducts[0]
const initialColor = initialProduct?.colors[0]

const initialElementsByView = {
  front: null,
  back: null,
  left: null,
  right: null,
  detail: null,
} satisfies Record<ProductViewId, DesignElement | null>

const initialSelectionByView = {
  front: null,
  back: null,
  left: null,
  right: null,
  detail: null,
} satisfies Record<ProductViewId, EditorElementId | null>

export function useEditorStudio() {
  const [selectedProductId, setSelectedProductId] = useState(
    initialProduct?.id ?? '',
  )
  const [selectedColorId, setSelectedColorId] = useState<ProductColorId>(
    initialColor?.id ?? 'white',
  )
  const [elementsByView, setElementsByView] = useState<
    Record<ProductViewId, DesignElement | null>
  >(initialElementsByView)
  const [logoErrorMessage, setLogoErrorMessage] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<ProductViewId>('front')
  const [selectedElementIdByView, setSelectedElementIdByView] =
    useState<Record<ProductViewId, EditorElementId | null>>(
      initialSelectionByView,
    )

  const selectedProduct =
    mockProducts.find((product) => product.id === selectedProductId) ??
    initialProduct
  const selectedColor =
    selectedProduct?.colors.find((color) => color.id === selectedColorId) ??
    selectedProduct?.colors[0]
  const availableViews = useMemo(
    () => getAvailableViews(selectedColor),
    [selectedColor],
  )
  const resolvedActiveView = availableViews.includes(activeView)
    ? activeView
    : availableViews[0]
  const activeProductView =
    selectedColor && resolvedActiveView
      ? selectedColor.views[resolvedActiveView] ?? null
      : null
  const activeLogoElement =
    elementsByView[resolvedActiveView ?? 'front']
  const selectedElementId =
    selectedElementIdByView[resolvedActiveView ?? 'front']
  const isLogoSelected = selectedElementId === activeLogoElement?.id
  const logoControls =
    isLogoSelected && activeLogoElement
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
      Object.values(elementsByViewRef.current).forEach((element) => {
        if (element) {
          URL.revokeObjectURL(element.asset.src)
        }
      })
    }
  }, [])

  async function handleLogoFileSelect(file: File | null) {
    if (!file || !activeProductView || !resolvedActiveView) {
      return
    }

    if (!isAcceptedLogoMimeType(file.type)) {
      setLogoErrorMessage(
        'Fichier invalide. Utilise un logo PNG, JPG, JPEG, SVG ou PDF.',
      )
      return
    }

    if (file.size > maxLogoFileSizeInBytes) {
      setLogoErrorMessage('Fichier trop lourd. Utilise un logo de 5 Mo maximum.')
      return
    }

    try {
      const uploadedLogo = await createUploadedLogoFromFile(file)
      const nextSize = getDefaultLogoSize(
        (uploadedLogo.width ?? 1) / (uploadedLogo.height ?? 1),
        activeProductView.printableArea.width /
          activeProductView.printableArea.height,
      )

      setElementsByView((currentElementsByView) => {
        const currentElement = currentElementsByView[resolvedActiveView]

        if (currentElement) {
          URL.revokeObjectURL(currentElement.asset.src)
        }

        return {
          ...currentElementsByView,
          [resolvedActiveView]: {
            asset: uploadedLogo,
            id: 'logo',
            position: getCenteredLogoPosition(nextSize),
            size: nextSize,
            type: 'image',
          },
        }
      })
      setLogoErrorMessage(null)
      setSelectedElementIdByView((currentSelectionByView) => ({
        ...currentSelectionByView,
        [resolvedActiveView]: 'logo',
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
    if (!resolvedActiveView) {
      return
    }

    setElementsByView((currentElementsByView) => {
      const currentElement = currentElementsByView[resolvedActiveView]

      if (currentElement) {
        URL.revokeObjectURL(currentElement.asset.src)
      }

      return {
        ...currentElementsByView,
        [resolvedActiveView]: null,
      }
    })
    setSelectedElementIdByView((currentSelectionByView) => ({
      ...currentSelectionByView,
      [resolvedActiveView]: null,
    }))
    setLogoErrorMessage(null)
  }

  function handleLogoControlsChange(controls: LogoManualControls) {
    if (!activeLogoElement || !resolvedActiveView) {
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

    setElementsByView((currentElementsByView) => {
      const currentElement = currentElementsByView[resolvedActiveView]

      return {
        ...currentElementsByView,
        [resolvedActiveView]: currentElement
          ? {
              ...currentElement,
              position: {
                x: normalizedControls.x,
                y: normalizedControls.y,
              },
              size: nextSize,
            }
          : currentElement,
      }
    })
  }

  function handleLogoPositionChange(position: DesignElement['position']) {
    if (!resolvedActiveView) {
      return
    }

    setElementsByView((currentElementsByView) => {
      const currentElement = currentElementsByView[resolvedActiveView]

      return {
        ...currentElementsByView,
        [resolvedActiveView]: currentElement
          ? {
              ...currentElement,
              position,
            }
          : currentElement,
      }
    })
  }

  function handleLogoSizeChange(size: DesignElement['size']) {
    if (!resolvedActiveView) {
      return
    }

    setElementsByView((currentElementsByView) => {
      const currentElement = currentElementsByView[resolvedActiveView]

      return {
        ...currentElementsByView,
        [resolvedActiveView]: currentElement
          ? {
              ...currentElement,
              size,
            }
          : currentElement,
      }
    })
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
      nextColor.views[activeView] ? activeView : nextView,
    )
  }

  return {
    activeLogoElement,
    activeProductView,
    activeView: resolvedActiveView ?? activeView,
    availableViews,
    handleElementSelect,
    handleColorSelect,
    handleLogoControlsChange,
    handleLogoFileSelect,
    handleLogoPositionChange,
    handleLogoRemove,
    handleLogoSizeChange,
    handleProductSelect,
    logoControls,
    logoErrorMessage,
    products: mockProducts,
    selectedColor,
    selectedColorId: selectedColor?.id ?? selectedColorId,
    selectedElementId,
    selectedProduct,
    setActiveView,
  }
}

function getAvailableViews(color: ProductColor | undefined) {
  if (!color) {
    return [] as ProductViewId[]
  }

  return (Object.keys(color.views) as ProductViewId[]).filter(
    (viewId) => Boolean(color.views[viewId]),
  )
}

function isAcceptedLogoMimeType(
  mimeType: string,
): mimeType is (typeof acceptedLogoMimeTypes)[number] {
  return acceptedLogoMimeTypes.some(
    (acceptedMimeType) => acceptedMimeType === mimeType,
  )
}
