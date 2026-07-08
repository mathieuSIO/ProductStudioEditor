import { describe, expect, it } from 'vitest'

import { createEditorStudioConfiguration } from '../../../test/factories/editor'
import { fixedIsoDate, mockStableCartIdentity } from '../../../test/mocks/time'
import { createCartItemFromEditor } from './createCartItemFromEditor'

describe('createCartItemFromEditor', () => {
  it('creates a stable studio cart snapshot from editor configuration', () => {
    mockStableCartIdentity('studio-cart-id')
    const configuration = createEditorStudioConfiguration()

    const item = createCartItemFromEditor(configuration)

    expect(item.id).toBe('studio-cart-id')
    expect(item.createdAt).toBe(fixedIsoDate)
    expect(item.kind).toBe('studio')
    if (item.kind !== 'studio') {
      throw new Error('Expected a studio cart item')
    }
    expect(item.design.customPlacement).toBe('Devant coeur')
    expect(item.quantities).toEqual({ M: 2 })
    expect(item.product).toEqual({
      catalogProductId: 100,
      catalogReferenceId: 200,
      category: 'top',
      id: 'tshirt',
      name: 'T-shirt studio',
      textileUnitPrice: 17.5,
    })
  })

  it('keeps only persistent logo preview URLs in the cart snapshot', () => {
    mockStableCartIdentity()
    const configuration = createEditorStudioConfiguration()

    const item = createCartItemFromEditor(configuration)

    if (item.kind !== 'studio') {
      throw new Error('Expected a studio cart item')
    }
    expect(item.design.views[2]?.logos).toEqual([
      {
        id: 'logo-1',
        mimeType: 'image/png',
        name: 'logo.png',
        originalFileSize: 12345,
        position: { x: 20, y: 30 },
        previewPersistence: 'persistent-url',
        previewUrl: 'https://cdn.mpm.test/logo.png',
        printFormat: 'A4',
        size: { height: 80, width: 120 },
        source: 'uploaded-file',
        storageKey: 'logos/logo.png',
      },
    ])
  })

  it('marks blob-only logo previews as temporary', () => {
    mockStableCartIdentity()
    const configuration = createEditorStudioConfiguration({
      elementsByView: {
        back: [],
        custom: [],
        front: [
          {
            asset: {
              mimeType: 'image/png',
              name: 'temporary-logo.png',
              size: 100,
              src: 'blob:temporary-logo',
            },
            id: 'logo-temporary',
            position: { x: 0, y: 0 },
            printFormat: 'A5',
            size: { height: 40, width: 40 },
            type: 'image',
          },
        ],
      },
    })

    const item = createCartItemFromEditor(configuration)

    if (item.kind !== 'studio') {
      throw new Error('Expected a studio cart item')
    }
    expect(item.design.views[2]?.logos[0]).toMatchObject({
      previewPersistence: 'temporary-object-url',
      previewUrl: null,
    })
  })
})
