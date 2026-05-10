import type {
  DesignElement,
  Product,
  ProductColor,
  ProductView,
  ProductViewId,
} from '../types'

type CreateFinalPreviewFileInput = {
  elements: DesignElement[]
  fileName?: string
  product: Product
  productColor: ProductColor
  productView: ProductView
  viewId: ProductViewId
}

type Rect = {
  height: number
  width: number
  x: number
  y: number
}

const canvasWidth = 1200
const canvasHeight = 1500
const productFrame = {
  x: 180,
  y: 130,
  width: 840,
  height: 1120,
} satisfies Rect

export async function createFinalPreviewFile({
  elements,
  fileName = 'final-preview.png',
  product,
  productColor,
  productView,
  viewId,
}: CreateFinalPreviewFileInput): Promise<File> {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error("Impossible de generer l'apercu final.")
  }

  canvas.width = canvasWidth
  canvas.height = canvasHeight

  drawBackground(context)
  await drawProduct(context, productView, productColor)
  await drawLogos(context, elements, productView)
  drawCaption(context, product.name, productColor.label, viewId)

  const blob = await canvasToBlob(canvas)

  if (!blob) {
    throw new Error("Impossible de preparer l'apercu final.")
  }

  return new File([blob], fileName, { type: 'image/png' })
}

function drawBackground(context: CanvasRenderingContext2D): void {
  context.fillStyle = '#F8FAFC'
  context.fillRect(0, 0, canvasWidth, canvasHeight)

  const gradient = context.createLinearGradient(0, 0, 0, canvasHeight)
  gradient.addColorStop(0, '#EFF6FF')
  gradient.addColorStop(0.55, '#FFFFFF')
  gradient.addColorStop(1, '#FEF2F2')
  context.fillStyle = gradient
  context.fillRect(48, 48, canvasWidth - 96, canvasHeight - 96)
}

async function drawProduct(
  context: CanvasRenderingContext2D,
  productView: ProductView,
  productColor: ProductColor,
): Promise<void> {
  if (productView.asset.kind === 'image') {
    const image = await loadImage(productView.asset.src)
    drawContainedImage(context, image, productFrame)
    return
  }

  drawFallbackProduct(context, productColor.swatchHex)
}

async function drawLogos(
  context: CanvasRenderingContext2D,
  elements: DesignElement[],
  productView: ProductView,
): Promise<void> {
  const printableArea = {
    x: productFrame.x + (productView.printableArea.x / 100) * productFrame.width,
    y: productFrame.y + (productView.printableArea.y / 100) * productFrame.height,
    width: (productView.printableArea.width / 100) * productFrame.width,
    height: (productView.printableArea.height / 100) * productFrame.height,
  } satisfies Rect

  for (const element of elements) {
    const logoImage = await loadImage(
      element.asset.previewSrc ??
        element.asset.persistentUrl ??
        element.asset.src,
    )
    const logoRect = {
      x: printableArea.x + (element.position.x / 100) * printableArea.width,
      y: printableArea.y + (element.position.y / 100) * printableArea.height,
      width: (element.size.width / 100) * printableArea.width,
      height: (element.size.height / 100) * printableArea.height,
    } satisfies Rect

    drawContainedImage(context, logoImage, logoRect)
  }
}

function drawFallbackProduct(
  context: CanvasRenderingContext2D,
  swatchHex: string,
): void {
  context.save()
  context.shadowColor = 'rgba(15, 23, 42, 0.18)'
  context.shadowBlur = 42
  context.shadowOffsetY = 28
  roundedRect(context, productFrame.x, productFrame.y, productFrame.width, productFrame.height, 92)
  context.fillStyle = swatchHex
  context.fill()
  context.restore()

  context.strokeStyle = 'rgba(15, 23, 42, 0.16)'
  context.lineWidth = 4
  roundedRect(context, productFrame.x, productFrame.y, productFrame.width, productFrame.height, 92)
  context.stroke()
}

function drawCaption(
  context: CanvasRenderingContext2D,
  productName: string,
  productColorLabel: string,
  viewId: ProductViewId,
): void {
  context.fillStyle = '#1E3A8A'
  context.font = '600 34px Arial, sans-serif'
  context.textAlign = 'center'
  context.fillText(`${productName} - ${productColorLabel}`, canvasWidth / 2, 1340)

  context.fillStyle = '#64748B'
  context.font = '500 24px Arial, sans-serif'
  context.fillText(`Vue ${getViewLabel(viewId)}`, canvasWidth / 2, 1382)
}

function drawContainedImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  rect: Rect,
): void {
  const imageRatio = image.naturalWidth / image.naturalHeight
  const rectRatio = rect.width / rect.height
  const width = imageRatio > rectRatio ? rect.width : rect.height * imageRatio
  const height = imageRatio > rectRatio ? rect.width / imageRatio : rect.height
  const x = rect.x + (rect.width - width) / 2
  const y = rect.y + (rect.height - height) / 2

  context.drawImage(image, x, y, width, height)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Impossible de charger une image de l'apercu final."))
    image.src = src
  })
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const resolvedRadius = Math.min(radius, width / 2, height / 2)

  context.beginPath()
  context.moveTo(x + resolvedRadius, y)
  context.lineTo(x + width - resolvedRadius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + resolvedRadius)
  context.lineTo(x + width, y + height - resolvedRadius)
  context.quadraticCurveTo(x + width, y + height, x + width - resolvedRadius, y + height)
  context.lineTo(x + resolvedRadius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - resolvedRadius)
  context.lineTo(x, y + resolvedRadius)
  context.quadraticCurveTo(x, y, x + resolvedRadius, y)
  context.closePath()
}

function getViewLabel(viewId: ProductViewId): string {
  switch (viewId) {
    case 'front':
      return 'avant'
    case 'back':
      return 'arriere'
    case 'custom':
      return 'autre'
    default:
      return viewId
  }
}
