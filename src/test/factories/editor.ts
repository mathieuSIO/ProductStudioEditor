import type { EditorStudioConfiguration } from '../../features/editor/types'

export function createEditorStudioConfiguration(
  overrides: Partial<EditorStudioConfiguration> = {},
): EditorStudioConfiguration {
  return {
    color: {
      availability: 'real',
      id: 'white',
      label: 'Blanc',
      swatchHex: '#ffffff',
      views: {},
    },
    customPlacement: '  Devant coeur  ',
    elementsByView: {
      back: [],
      custom: [],
      front: [
        {
          asset: {
            mimeType: 'image/png',
            name: 'logo.png',
            persistentUrl: 'https://cdn.mpm.test/logo.png',
            size: 12345,
            src: 'blob:logo-preview',
            storageKey: 'logos/logo.png',
          },
          id: 'logo-1',
          position: {
            x: 20,
            y: 30,
          },
          printFormat: 'A4',
          size: {
            height: 80,
            width: 120,
          },
          type: 'image',
        },
      ],
    },
    finalPreviewUrl: 'https://cdn.mpm.test/final-front.png',
    finalPreviewUrls: {
      front: 'https://cdn.mpm.test/final-front.png',
    },
    pricing: {
      appliedTier: null,
      grandTotal: 55,
      logoLines: [],
      logosCount: 1,
      printTotal: 20,
      textileTotal: 35,
      textileUnitPrice: 17.5,
      totalQuantity: 2,
    },
    product: {
      catalogProductId: 100,
      catalogReferenceId: 200,
      category: 'top',
      colors: [],
      id: 'tshirt',
      name: 'T-shirt studio',
      sizes: ['M', 'L'],
      textileUnitPrice: 17.5,
    },
    quantities: {
      L: 0,
      M: 2.8,
    },
    ...overrides,
  }
}
