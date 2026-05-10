export type PreviewImageViewId = 'back' | 'custom' | 'front' | 'main'

export type PreviewImage = {
  label: string
  url: string
  viewId: PreviewImageViewId
}

export type FinalPreviewUrls = Partial<
  Record<Exclude<PreviewImageViewId, 'main'>, string>
>

type GetPreviewImagesInput = {
  finalPreviewUrl?: string | null
  finalPreviewUrls?: FinalPreviewUrls | null
}

const previewLabels = {
  back: 'Face arriere',
  custom: 'Placement personnalise',
  front: 'Face avant',
  main: 'Apercu principal',
} satisfies Record<PreviewImageViewId, string>

const orderedViewIds = ['front', 'back', 'custom'] satisfies Array<
  Exclude<PreviewImageViewId, 'main'>
>

export function getPreviewImages({
  finalPreviewUrl,
  finalPreviewUrls,
}: GetPreviewImagesInput): PreviewImage[] {
  const usedUrls = new Set<string>()
  const images: PreviewImage[] = []

  for (const viewId of orderedViewIds) {
    const url = finalPreviewUrls?.[viewId]

    if (isDisplayablePreviewUrl(url) && !usedUrls.has(url)) {
      images.push({
        label: previewLabels[viewId],
        url,
        viewId,
      })
      usedUrls.add(url)
    }
  }

  if (
    isDisplayablePreviewUrl(finalPreviewUrl) &&
    !usedUrls.has(finalPreviewUrl)
  ) {
    images.push({
      label: previewLabels.main,
      url: finalPreviewUrl,
      viewId: 'main',
    })
  }

  return images
}

function isDisplayablePreviewUrl(
  value: string | null | undefined,
): value is string {
  return typeof value === 'string' && value.length > 0 && !value.startsWith('blob:')
}
