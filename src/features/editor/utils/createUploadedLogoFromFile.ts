import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs'

import type { UploadedLogo } from '../types'

GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.mjs',
  import.meta.url,
).toString()

export async function createUploadedLogoFromFile(
  file: File,
): Promise<UploadedLogo> {
  if (file.type === 'application/pdf') {
    return createUploadedLogoFromPdf(file)
  }

  return createUploadedLogoFromImage(file)
}

async function createUploadedLogoFromImage(
  file: File,
): Promise<UploadedLogo> {
  const objectUrl = URL.createObjectURL(file)

  try {
    const dimensions = await getImageDimensions(objectUrl)

    return {
      name: file.name,
      mimeType: file.type,
      size: file.size,
      src: objectUrl,
      width: dimensions.width,
      height: dimensions.height,
    }
  } catch (error) {
    URL.revokeObjectURL(objectUrl)
    throw error
  }
}

async function createUploadedLogoFromPdf(file: File): Promise<UploadedLogo> {
  const fileBytes = await file.arrayBuffer()
  const pdfDocument = await getDocument({ data: fileBytes }).promise

  try {
    const firstPage = await pdfDocument.getPage(1)
    const viewport = firstPage.getViewport({ scale: 2 })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('canvas-unavailable')
    }

    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)

    await firstPage.render({
      canvas,
      canvasContext: context,
      viewport,
    }).promise

    const blob = await canvasToBlob(canvas)

    if (!blob) {
      throw new Error('pdf-preview-unavailable')
    }

    const previewUrl = URL.createObjectURL(blob)

    return {
      name: file.name,
      mimeType: file.type,
      size: file.size,
      src: previewUrl,
      width: canvas.width,
      height: canvas.height,
    }
  } finally {
    pdfDocument.destroy()
  }
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

function getImageDimensions(src: string) {
  return new Promise<{ height: number; width: number }>((resolve, reject) => {
    const image = new Image()

    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      })
    }

    image.onerror = () => {
      reject(new Error('image-preview-unavailable'))
    }

    image.src = src
  })
}
