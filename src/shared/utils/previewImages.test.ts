import { describe, expect, it } from 'vitest'

import { getPreviewImages } from './previewImages'

describe('getPreviewImages', () => {
  it('returns persistent view previews in product view order', () => {
    const images = getPreviewImages({
      finalPreviewUrls: {
        back: 'https://cdn.mpm.test/back.png',
        custom: 'https://cdn.mpm.test/custom.png',
        front: 'https://cdn.mpm.test/front.png',
      },
    })

    expect(images.map((image) => image.viewId)).toEqual(['front', 'back', 'custom'])
  })

  it('removes duplicate and blob previews from displayable images', () => {
    const images = getPreviewImages({
      finalPreviewUrl: 'https://cdn.mpm.test/front.png',
      finalPreviewUrls: {
        back: 'blob:back',
        front: 'https://cdn.mpm.test/front.png',
      },
    })

    expect(images).toEqual([
      {
        label: 'Face avant',
        url: 'https://cdn.mpm.test/front.png',
        viewId: 'front',
      },
    ])
  })
})
