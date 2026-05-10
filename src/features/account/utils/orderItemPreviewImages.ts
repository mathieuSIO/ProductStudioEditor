import {
  getPreviewImages,
  type FinalPreviewUrls,
  type PreviewImage,
} from '../../../shared/utils/previewImages'
import type { OrderItemDetails } from '../types/account.types'

export function getOrderItemPreviewImages(
  item: OrderItemDetails,
): PreviewImage[] {
  return getPreviewImages({
    finalPreviewUrl: item.finalPreviewUrl,
    finalPreviewUrls:
      item.finalPreviewUrls ?? readFinalPreviewUrls(item.customization),
  })
}

function readFinalPreviewUrls(
  customization: Record<string, unknown> | null | undefined,
): FinalPreviewUrls | null {
  const design = readRecord(customization, 'design')
  const finalPreviewUrls = readRecord(design, 'finalPreviewUrls')

  if (!finalPreviewUrls) {
    return null
  }

  return {
    front: readString(finalPreviewUrls, 'front'),
    back: readString(finalPreviewUrls, 'back'),
    custom: readString(finalPreviewUrls, 'custom'),
  }
}

function readRecord(
  value: Record<string, unknown> | null | undefined,
  key: string,
): Record<string, unknown> | null {
  const nestedValue = value?.[key]

  return isRecord(nestedValue) ? nestedValue : null
}

function readString(
  value: Record<string, unknown>,
  key: string,
): string | undefined {
  const nestedValue = value[key]

  return typeof nestedValue === 'string' ? nestedValue : undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
